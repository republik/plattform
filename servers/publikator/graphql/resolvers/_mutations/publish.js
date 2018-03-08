const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { descending } = require('d3-array')
const querystring = require('querystring')
const yaml = require('../../../lib/yaml')
const {
  createGithubClients,
  publicationVersionRegex,
  getAnnotatedTags,
  upsertRef,
  deleteRef
} = require('../../../lib/github')
const {
  redlock,
  lockKey,
  refresh: refreshScheduling
} = require('../../../lib/publicationScheduler')
const {
  createCampaign,
  updateCampaignContent,
  getCampaign
} = require('../../../lib/mailchimp')

const placeMilestone = require('./placeMilestone')
const { document: getDocument } = require('../Commit')
const editRepoMeta = require('./editRepoMeta')
const { meta: getRepoMeta } = require('../Repo')
const { Redirections: { get: getRedirections } } = require('@orbiting/backend-modules-redirections')
const {
  prepareMetaForPublish,
  handleRedirection
} = require('../../../lib/Document')
const {
  graphql: {
    resolvers: { queries: { documents: getPublishedDocuments } }
  },
  lib: {
    html: { get: getHTML },
    resolve: {
      contentUrlResolver,
      metaUrlResolver,
      metaFieldResolver
    }
  }
} = require('@orbiting/backend-modules-documents')
const { lib: {
  Repo: { uploadImages }
} } = require('@orbiting/backend-modules-assets')
const uniq = require('lodash/uniq')

const {
  FRONTEND_BASE_URL,
  PIWIK_URL_BASE,
  PIWIK_SITE_ID
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
  const { user, t, redis, pubsub } = context
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()
  const now = new Date()

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

  // check if all references (link, format, dossiert, etc.) in the document can be resolved
  // for front: warn if related document cannot be resolved
  // for newsletter, preview email: stop publication
  let unresolvedRepoIds = []
  const docsConnection = await getPublishedDocuments(null, { scheduledAt }, context)

  // see https://github.com/orbiting/backends/blob/c25cf33336729590b114e5113e464be6bf1185e0/packages/documents/graphql/resolvers/_queries/documents.js#L107
  // - the documents resolver exposes those two properties on individual docs for resolving
  // - we steal them here for our new doc
  const firstDoc = docsConnection.nodes[0] || {} // in case no docs are published
  const allDocs = firstDoc._all
  const allUsernames = firstDoc._usernames

  const resolvedDoc = JSON.parse(JSON.stringify(doc))
  const utmParams = {
    'utm_source': 'newsletter',
    'utm_medium': 'email',
    'utm_campaign': repoId
  }
  const searchString = '?' + querystring.stringify(utmParams)
  contentUrlResolver(resolvedDoc, allDocs, allUsernames, unresolvedRepoIds, FRONTEND_BASE_URL, searchString)
  metaUrlResolver(resolvedDoc.content.meta, allDocs, allUsernames, unresolvedRepoIds, FRONTEND_BASE_URL, searchString)
  metaFieldResolver(resolvedDoc.content.meta, allDocs, unresolvedRepoIds)
  unresolvedRepoIds = uniq(unresolvedRepoIds)
  if (unresolvedRepoIds.length && (!ignoreUnresolvedRepoIds || doc.content.meta.template === 'editorialNewsletter' || updateMailchimp)) {
    return {
      unresolvedRepoIds
    }
  }

  // prepareMetaForPublish creates missing discussions as a side-effect
  doc.content.meta = await prepareMetaForPublish(
    repoId,
    doc.content.meta,
    repoMeta,
    scheduledAt,
    now,
    context
  )

  // add fileds from prepareMetaForPublish to resolvedDoc
  resolvedDoc.content.meta = {
    ...resolvedDoc.content.meta,
    path: doc.content.meta.path,
    publishDate: doc.content.meta.publishDate,
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
    throw new Error(t('api/publish/document/slug/redirectsExist', { path: newPath }))
  }
  // deny if published or scheduled-published slug exists for another repo
  const repoIds = await redis.smembersAsync('repos:ids')
  const publishedRepos = await Promise.all([
    ...repoIds.map(id => redis.getAsync(`repos:${id}/publication`)),
    ...repoIds.map(id => redis.getAsync(`repos:${id}/scheduled-publication`))
  ])
    .then(repos => repos
      .filter(Boolean)
      .map(repo => JSON.parse(repo))
    )
  for (let pubRepo of publishedRepos) {
    const existingPath = pubRepo.doc && pubRepo.doc.content &&
      pubRepo.doc.content.meta && pubRepo.doc.content.meta.path
    if (existingPath && existingPath === newPath && repoId !== pubRepo.repoId) {
      throw new Error(t('api/publish/document/slug/docExists', { path: newPath }))
    }
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
      await redis.setAsync(campaignKey, campaignId)
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
    {
      user,
      pubsub
    }
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
          `tags/prepublication`,
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

  // cache in redis
  const payload = JSON.stringify({
    doc,
    sha: milestone.sha,
    repoId: repoId
  })
  const key = `repos:${repoId}/${ref}`
  let redisOps = [
    redis.setAsync(key, payload),
    redis.saddAsync('repos:ids', repoId)
  ]
  if (scheduledAt) {
    redisOps.push(redis.zaddAsync(`repos:scheduledIds`, scheduledAt.getTime(), key))
  } else {
    if (ref === 'publication') {
      redisOps = redisOps.concat([
        // prepublication moves along with publication
        redis.setAsync(`repos:${repoId}/prepublication`, payload),
        // remove previous scheduling
        redis.delAsync(`repos:${repoId}/scheduled-publication`),
        redis.zremAsync(`repos:scheduledIds`, `repos:${repoId}/scheduled-publication`)
      ])
    } else {
      redisOps = redisOps.concat([
        // remove previous scheduling
        redis.delAsync(`repos:${repoId}/scheduled-prepublication`),
        redis.zremAsync(`repos:scheduledIds`, `repos:${repoId}/scheduled-prepublication`)
      ])
    }
  }

  const lock = await redlock().lock(lockKey, 200)
  await Promise.all(redisOps)
  await refreshScheduling(lock)
  await lock.unlock()
    .catch((err) => {
      console.error(err)
    })

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
        `<img src="${openBeacon}" height="1" width="1"></body>`
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
