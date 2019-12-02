const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { descending } = require('d3-array')
const querystring = require('querystring')
const sleep = require('await-sleep')
const yaml = require('../../../lib/yaml')
const {
  createGithubClients,
  publicationVersionRegex,
  getAnnotatedTags,
  upsertRef,
  deleteRef
} = require('../../../lib/github')
const {
  createCampaign,
  updateCampaignContent,
  getCampaign
} = require('../../../lib/mailchimp')

const placeMilestone = require('./placeMilestone')
const { document: getDocument } = require('../Commit')
const editRepoMeta = require('./editRepoMeta')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../Repo')
const { Redirections: { get: getRedirections } } = require('@orbiting/backend-modules-redirections')
const {
  prepareMetaForPublish,
  handleRedirection
} = require('../../../lib/Document')
const {
  lib: {
    html: { get: getHTML },
    resolve: {
      contentUrlResolver,
      metaUrlResolver,
      metaFieldResolver
    }
  }
} = require('@orbiting/backend-modules-documents')
const {
  lib: {
    Repo: { uploadImages }
  }
} = require('@orbiting/backend-modules-assets')
const uniq = require('lodash/uniq')
const { upsert: repoCacheUpsert } = require('../../../lib/cache/upsert')

const { purgeUrls } = require('@orbiting/backend-modules-keyCDN')

const {
  FRONTEND_BASE_URL,
  PIWIK_URL_BASE,
  PIWIK_SITE_ID,
  DISABLE_PUBLISH
} = process.env

module.exports = async (
  _,
  {
    repoId,
    commitId,
    prepublication,
    scheduledAt: _scheduledAt,
    updateMailchimp = false,
    ignoreUnresolvedRepoIds = false
  },
  context
) => {
  const { user, t, redis, pubsub, elastic } = context
  ensureUserHasRole(user, 'editor')

  if (DISABLE_PUBLISH) {
    throw new Error(t('api/publish/disabled'))
  }

  const { githubRest } = await createGithubClients()
  const now = new Date()

  // TODO investigate why this fires
  // Error: queries.search defined in resolvers, but not in schema
  // if it's put at root level
  const {
    lib: {
      Documents: {
        createPublish,
        getElasticDoc,
        isPathUsed,
        findTemplates,
        addRelatedDocs
      },
      utils: { getIndexAlias }
    }
  } = require('@orbiting/backend-modules-search')

  // check max scheduledAt
  let scheduledAt
  if (_scheduledAt) {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 20)
    if (_scheduledAt > maxDate) {
      throw new Error(t('api/publish/scheduledAt/tooFarInTheFuture', {
        days: 20
      }))
    }
    if (_scheduledAt > now) { // otherwise it's not scheduled but instant
      scheduledAt = _scheduledAt
    }
  }

  // load and check document
  const doc = await getDocument(
    { id: commitId, repo: { id: repoId } },
    { publicAssets: true },
    context
  )
  if (doc.content.meta.template !== 'front' && !doc.content.meta.slug) {
    throw new Error(t('api/publish/document/slug/404'))
  }
  const repoMeta = await getRepoMeta({ id: repoId })

  const indexType = 'Document'

  // check if all references (link, format, dossiert, etc.) in the document
  // can be resolved
  // for front: warn if related document cannot be resolved
  // for newsletter, preview email: stop publication
  let unresolvedRepoIds = []

  const connection = Object.assign({}, {
    nodes: [
      {
        type: indexType,
        entity: getElasticDoc({
          indexType: indexType,
          doc
        })
      }
    ]
  })

  await addRelatedDocs({
    connection,
    scheduledAt,
    ignorePrepublished: !prepublication,
    context
  })

  const { _all, _usernames } = connection.nodes[0].entity

  const resolvedDoc = JSON.parse(JSON.stringify(doc))

  const utmParams = {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: repoId
  }

  const searchString = '?' + querystring.stringify(utmParams)

  contentUrlResolver(
    resolvedDoc,
    _all,
    _usernames,
    unresolvedRepoIds,
    FRONTEND_BASE_URL,
    searchString
  )

  metaUrlResolver(
    resolvedDoc.content.meta,
    _all,
    _usernames,
    unresolvedRepoIds,
    FRONTEND_BASE_URL,
    searchString
  )

  metaFieldResolver(
    resolvedDoc.content.meta,
    _all,
    unresolvedRepoIds
  )

  unresolvedRepoIds = uniq(unresolvedRepoIds)

  if (
    unresolvedRepoIds.length &&
    (
      !ignoreUnresolvedRepoIds ||
      doc.content.meta.template === 'editorialNewsletter' ||
      updateMailchimp
    )
  ) {
    return {
      unresolvedRepoIds
    }
  }

  // prepareMetaForPublish creates missing discussions as a side-effect
  doc.content.meta = await prepareMetaForPublish({
    repoId,
    repoMeta,
    scheduledAt,
    prepublication,
    doc,
    now,
    context
  })

  // add fields from prepareMetaForPublish to resolvedDoc
  resolvedDoc.content.meta = {
    ...resolvedDoc.content.meta,
    path: doc.content.meta.path,
    publishDate: doc.content.meta.publishDate,
    lastPublishedAt: doc.content.meta.lastPublishedAt,
    discussionId: doc.content.meta.discussionId
  }

  // upload images to S3
  await uploadImages(repoId, doc.repoImagePaths)

  // check if slug is taken
  const newPath = doc.content.meta.path

  // deny if present redirect to other article / sth. else
  const existingRedirects = await getRedirections(
    newPath,
    { repo: { id: repoId } },
    context
  )
  if (existingRedirects.length) {
    throw new Error(t(
      'api/publish/document/slug/redirectsExist',
      { path: newPath }
    ))
  }

  if (await isPathUsed(elastic, newPath, repoId)) {
    throw new Error(t('api/publish/document/slug/docExists', { path: newPath }))
  }

  // remember if slug changed
  if (!prepublication) {
    await handleRedirection(repoId, doc.content.meta, context)
  }

  // get/create campaign on mailchimp
  // fail early if mailchimp not available
  let campaignId
  if (updateMailchimp) {
    const { title, emailSubject } = doc.content.meta
    if (!title || !emailSubject) {
      throw new Error('updateMailchimp missing title or subject', { title, emailSubject })
    }
    const campaignKey = `repos:${repoId}/mailchimp/campaignId`
    campaignId = await redis.getAsync(campaignKey)
    redis.expireAsync(repoId, redis.__defaultExpireSeconds)
    if (!campaignId) {
      if (repoMeta && repoMeta.mailchimpCampaignId) {
        campaignId = repoMeta.mailchimpCampaignId
      }
    }
    if (campaignId) {
      const { status } = await getCampaign({ id: campaignId })
      if (status === 404) {
        campaignId = null
      }
    }
    if (!campaignId) {
      const createResponse = await createCampaign({ title, subject: emailSubject })
      const { id, status } = createResponse
      if (status !== 'save') {
        throw new Error('Mailchimp: could not create campaign', createResponse)
      }
      campaignId = id
      await redis.setAsync(campaignKey, campaignId, 'EX', redis.__defaultExpireSeconds)
      await editRepoMeta(null, {
        repoId,
        mailchimpCampaignId: campaignId
      }, context)
    }
  }

  // calc version number
  const latestPublicationVersion = await getAnnotatedTags(repoId)
    .then(tags => tags
      .filter(tag => publicationVersionRegex.test(tag.name))
      .map(tag => parseInt(publicationVersionRegex.exec(tag.name)[1]))
      .sort((a, b) => descending(a, b))
      .shift()
    )
  const versionNumber = latestPublicationVersion
    ? latestPublicationVersion + 1
    : 1
  const versionName = prepublication
    ? `v${versionNumber}-prepublication`
    : `v${versionNumber}`

  const message = yaml.stringify(
    {
      scheduledAt,
      updateMailchimp
    },
    t('api/github/yaml/warning')
  )

  const milestone = await placeMilestone(
    null,
    {
      repoId,
      commitId,
      name: versionName,
      message
    },
    context
  )

  // move ref
  let ref = prepublication
    ? 'prepublication'
    : 'publication'
  if (scheduledAt) {
    ref = `scheduled-${ref}`
  }
  let gitOps = [
    upsertRef(
      repoId,
      `tags/${ref}`,
      milestone.sha
    )
  ]
  if (!scheduledAt) {
    if (ref === 'publication') {
      // prepublication moves along with publication
      gitOps = gitOps.concat(
        upsertRef(
          repoId,
          'tags/prepublication',
          milestone.sha
        )
      )
    }
    // overwrite previous scheduling
    gitOps = gitOps.concat(
      deleteRef(
        repoId,
        `tags/scheduled-${ref}`,
        true
      )
    )
  }
  await Promise.all(gitOps)

  const resolved = {}

  if (doc.content.meta.dossier) {
    const dossiers = await findTemplates(
      elastic,
      'dossier',
      doc.content.meta.dossier
    )

    if (!resolved.meta) resolved.meta = {}
    resolved.meta.dossier = dossiers.pop()
  }

  if (doc.content.meta.format) {
    const formats = await findTemplates(
      elastic,
      'format',
      doc.content.meta.format
    )

    if (!resolved.meta) resolved.meta = {}
    resolved.meta.format = formats.pop()
  }

  if (doc.content.meta.section) {
    const sections = await findTemplates(
      elastic,
      'section',
      doc.content.meta.section
    )

    if (!resolved.meta) resolved.meta = {}
    resolved.meta.section = sections.pop()
  }

  // publish to elasticsearch
  const elasticDoc = getElasticDoc({
    indexName: getIndexAlias(indexType.toLowerCase(), 'write'),
    indexType: indexType,
    doc,
    commitId,
    versionName,
    milestoneCommitId: milestone.sha,
    resolved
  })

  const { insert, after } = createPublish(
    { prepublication, scheduledAt, elasticDoc, elastic, redis }
  )
  await insert()
  await after()
  await sleep(2 * 1000)

  await repoCacheUpsert({
    id: repoId,
    meta: repoMeta,
    publications: await getLatestPublications({ id: repoId })
  }, context)

  // release for nice view on github
  // this is optional, the release is not read back again
  const [login, repoName] = repoId.split('/')
  await githubRest.repos.createRelease({
    owner: login,
    repo: repoName,
    tag_name: milestone.name,
    name: versionName,
    draft: false,
    prerelease: prepublication
  })
    .then(response => response.data)

  // do the mailchimp update
  if (campaignId) {
    let html = getHTML(resolvedDoc)

    if (PIWIK_URL_BASE && PIWIK_SITE_ID) {
      const openBeacon = `${PIWIK_URL_BASE}/piwik.php?${querystring.stringify({
        idsite: PIWIK_SITE_ID,
        url: FRONTEND_BASE_URL + doc.content.meta.path,
        rec: 1,
        bots: 1,
        action_name: `Email: ${doc.content.meta.emailSubject}`,
        ...utmParams
      })}&_id=*|DATE:ymd|**|UNIQID|*`
      html = html.replace(
        '</body>',
        `<img alt="" src="${openBeacon}" height="1" width="1"></body>`
      )
    }

    const updateResponse = await updateCampaignContent({
      campaignId,
      html
    })
    if (updateResponse.status) {
      throw new Error('Mailchimp: could not update campaign', updateResponse)
    }
  }

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  // purge pdfs in CDN
  const purgeQueries = [
    '',
    '?download=1',
    '?images=0',
    '?images=0&download=1',
    '?download=1&images=0'
  ]
  purgeUrls(purgeQueries.map(q => `/pdf${newPath}.pdf${q}`))

  return {
    unresolvedRepoIds,
    publication: {
      ...milestone,
      live: !scheduledAt,
      meta: {
        scheduledAt,
        updateMailchimp
      },
      document: doc.content
    }
  }
}
