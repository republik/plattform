const { descending } = require('d3-array')
const querystring = require('querystring')
// const sleep = require('await-sleep')
const debug = require('debug')('publikator:mutation:publish')
const uniq = require('lodash/uniq')

const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')
const {
  lib: {
    Documents: {
      createPublish,
      getElasticDoc,
      isPathUsed,
      findTemplates,
      addRelatedDocs,
    },
    utils: { getIndexAlias },
  },
} = require('@orbiting/backend-modules-search')
const {
  lib: {
    html: { get: getHTML },
    resolve: { contentUrlResolver, metaUrlResolver, metaFieldResolver },
  },
} = require('@orbiting/backend-modules-documents')
const {
  Redirections: { get: getRedirections },
} = require('@orbiting/backend-modules-redirections')
const { purgeUrls } = require('@orbiting/backend-modules-keyCDN')

const {
  maybeDelcareMilestonePublished,
  updateCurrentPhase,
  updateRepo,
  publicationVersionRegex,
} = require('../../../lib/postgres')
const {
  createCampaign,
  updateCampaign,
  updateCampaignContent,
  getCampaign,
} = require('../../../lib/mailchimp')
const {
  prepareMetaForPublish,
  handleRedirection,
} = require('../../../lib/Document')
const { notifyPublish } = require('../../../lib/Notifications')
const { document: getDocument } = require('../Commit')

const { FRONTEND_BASE_URL, PIWIK_URL_BASE, PIWIK_SITE_ID, DISABLE_PUBLISH } =
  process.env

module.exports = async (
  _,
  {
    repoId,
    commitId,
    prepublication,
    scheduledAt: _scheduledAt,
    updateMailchimp = false,
    notifySubscribers = false,
    ignoreUnresolvedRepoIds = false,
  },
  context,
) => {
  const { user, t, redis, elastic, pgdb, pubsub, loaders } = context
  ensureUserHasRole(user, 'editor')

  if (DISABLE_PUBLISH) {
    throw new Error(t('api/publish/disabled'))
  }

  const now = new Date()

  // check max scheduledAt
  let scheduledAt
  if (_scheduledAt) {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 20)
    if (_scheduledAt > maxDate) {
      throw new Error(
        t('api/publish/scheduledAt/tooFarInTheFuture', {
          days: 20,
        }),
      )
    }
    if (_scheduledAt > now) {
      // otherwise it's not scheduled but instant
      scheduledAt = _scheduledAt
    }
  }

  const commit = await context.loaders.Commit.byId.load(commitId)
  const { meta: repoMeta } = await context.loaders.Repo.byId.load(repoId)

  // load and check document
  const doc = await getDocument(
    commit, // { id: commitId, repo: { id: repoId }, repoId },
    { publicAssets: true },
    context,
  )
  if (doc.content.meta.template !== 'front' && !doc.content.meta.slug) {
    throw new Error(t('api/publish/document/slug/404'))
  }

  const indexType = 'Document'

  // check if all references (link, format, dossiert, etc.) in the document
  // can be resolved
  // for front: warn if related document cannot be resolved
  // for newsletter, preview email: stop publication
  let unresolvedRepoIds = []

  const connection = Object.assign(
    {},
    {
      nodes: [
        {
          type: indexType,
          entity: getElasticDoc({
            indexType: indexType,
            doc,
          }),
        },
      ],
    },
  )

  await addRelatedDocs({
    connection,
    scheduledAt,
    ignorePrepublished: !prepublication,
    context,
  })

  const { _all, _usernames } = connection.nodes[0].entity

  const resolvedDoc = JSON.parse(JSON.stringify(doc))

  const utmParams = {
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_campaign: repoId,
  }

  const searchString = '?' + querystring.stringify(utmParams)

  contentUrlResolver(
    resolvedDoc,
    _all,
    _usernames,
    unresolvedRepoIds,
    FRONTEND_BASE_URL,
    searchString,
  )

  metaUrlResolver(
    resolvedDoc.content.meta,
    _all,
    _usernames,
    unresolvedRepoIds,
    FRONTEND_BASE_URL,
    searchString,
  )

  metaFieldResolver(resolvedDoc.content.meta, _all, unresolvedRepoIds)

  unresolvedRepoIds = uniq(unresolvedRepoIds).filter(
    (unresolvedRepoId) => unresolvedRepoId !== repoId,
  )

  if (
    unresolvedRepoIds.length &&
    (!ignoreUnresolvedRepoIds ||
      doc.content.meta.template === 'editorialNewsletter' ||
      updateMailchimp)
  ) {
    return {
      unresolvedRepoIds,
    }
  }

  // prepareMetaForPublish creates missing discussions as a side-effect
  doc.content.meta = await prepareMetaForPublish({
    repoId,
    repoMeta,
    scheduledAt,
    prepublication,
    notifySubscribers,
    doc,
    now,
    context,
  })

  // add fields from prepareMetaForPublish to resolvedDoc
  resolvedDoc.content.meta = {
    ...resolvedDoc.content.meta,
    path: doc.content.meta.path,
    publishDate: doc.content.meta.publishDate,
    lastPublishedAt: doc.content.meta.lastPublishedAt,
    discussionId: doc.content.meta.discussionId,
  }

  // check if slug is taken
  const newPath = doc.content.meta.path

  // deny if present redirect to other article / sth. else
  const existingRedirect = await getRedirections(
    newPath,
    { repo: { id: repoId } },
    context,
  )
  if (existingRedirect) {
    throw new Error(
      t('api/publish/document/slug/redirectsExist', { path: newPath }),
    )
  }

  if (await isPathUsed(elastic, newPath, repoId)) {
    throw new Error(t('api/publish/document/slug/docExists', { path: newPath }))
  }

  // remember if slug changed
  if (!prepublication && !scheduledAt) {
    await handleRedirection(repoId, doc.content.meta, context)
  }

  // get/create campaign on mailchimp
  // fail early if mailchimp not available
  let campaignId
  if (updateMailchimp) {
    campaignId = repoMeta.mailchimpCampaignId

    if (campaignId) {
      const { status } = await getCampaign({ id: campaignId })
      if (status === 404) {
        campaignId = null
      }
    }

    if (!campaignId) {
      const { id } = await createCampaign()
        .then((response) => response.json())
        .catch((error) => {
          console.error(error)
          throw new Error(t('api/publish/error/createCampaign'))
        })

      campaignId = id
    }
  }

  // calc version number
  const latestPublicationVersion = await context.loaders.Milestone.byRepoId
    .load(repoId)
    .then((tags) =>
      tags
        .filter((tag) => publicationVersionRegex.test(tag.name))
        .map((tag) => parseInt(publicationVersionRegex.exec(tag.name)[1]))
        .sort((a, b) => descending(a, b))
        .shift(),
    )

  const versionNumber = latestPublicationVersion
    ? latestPublicationVersion + 1
    : 1
  const versionName = prepublication
    ? `v${versionNumber}-prepublication`
    : `v${versionNumber}`

  const meta = {
    ...(updateMailchimp && { updateMailchimp }),
    ...(notifySubscribers && { notifySubscribers }),
  }

  const scope = (prepublication && 'prepublication') || 'publication'

  const author = {
    name: user.name,
    email: user.email,
  }

  const tx = await pgdb.transactionBegin()
  try {
    const milestone = await pgdb.publikator.milestones.insertAndGet({
      repoId,
      commitId: commit.id,
      name: versionName,
      meta,
      userId: user.id,
      author,
      createdAt: now,
      scope,
      scheduledAt: scheduledAt || now,
      publishedAt: (!scheduledAt && now) || null,
    })

    await maybeDelcareMilestonePublished(milestone, tx)
    await updateCurrentPhase(repoId, tx)
    await updateRepo(repoId, { mailchimpCampaignId: campaignId }, tx)

    await tx.transactionCommit()
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }

  const resolved = {}

  if (doc.content.meta.dossier) {
    const dossiers = await findTemplates(
      elastic,
      'dossier',
      doc.content.meta.dossier,
    )

    if (!resolved.meta) resolved.meta = {}
    resolved.meta.dossier = dossiers.pop()
  }

  if (doc.content.meta.format) {
    const formats = await findTemplates(
      elastic,
      'format',
      doc.content.meta.format,
    )

    if (!resolved.meta) resolved.meta = {}
    resolved.meta.format = formats.pop()
  }

  if (doc.content.meta.section) {
    const sections = await findTemplates(
      elastic,
      'section',
      doc.content.meta.section,
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
    resolved,
  })

  const { insert, after } = createPublish({
    prepublication,
    scheduledAt,
    elasticDoc,
    elastic,
    redis,
  })
  await insert()
  await after()

  // flush dataloaders
  await context.loaders.Document.byRepoId.clear(repoId)

  // do the mailchimp update
  if (campaignId) {
    // Update campaign configuration
    const { title, emailSubject, path } = doc.content.meta
    if (!title || !emailSubject) {
      throw new Error('Mailchimp: missing title or subject', {
        title,
        emailSubject,
      })
    }

    await updateCampaign({
      campaignId,
      campaignConfig: {
        key:
          resolved.meta &&
          resolved.meta.format &&
          resolved.meta.format.meta &&
          resolved.meta.format.meta.repoId,
        subject_line: emailSubject,
        title,
      },
    }).catch((error) => {
      console.error(error)
      throw new Error(t('api/publish/error/updateCampaign'))
    })

    // Update campaign content (HTML)
    let html = getHTML(resolvedDoc)

    if (PIWIK_URL_BASE && PIWIK_SITE_ID) {
      const openBeacon = `${PIWIK_URL_BASE}/piwik.php?${querystring.stringify({
        idsite: PIWIK_SITE_ID,
        url: FRONTEND_BASE_URL + path,
        rec: 1,
        bots: 1,
        action_name: `Email: ${emailSubject}`,
        ...utmParams,
      })}&_id=*|DATE:ymd|**|UNIQID|*`
      html = html.replace(
        '</body>',
        `<img alt="" src="${openBeacon}" height="1" width="1"></body>`,
      )
    }

    await updateCampaignContent({ campaignId, html }).catch((error) => {
      console.error(error)
      throw new Error(t('api/publish/error/updateCampaignContent'))
    })
  }

  // @TODO: Safe to remove, once repoChange is adopted
  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId,
    },
  })

  // purge pdfs in CDN
  const purgeQueries = [
    '',
    '?download=1',
    '?images=0',
    '?images=0&download=1',
    '?download=1&images=0',
  ]
  await purgeUrls(purgeQueries.map((q) => `/pdf${newPath}.pdf${q}`))

  if (notifySubscribers && !prepublication && !scheduledAt) {
    await notifyPublish(repoId, context)
  }

  const publication = (
    await loaders.Milestone.Publication.byRepoId.load(repoId)
  ).find((p) => p.name === versionName)

  await pubsub.publish('repoChange', {
    repoChange: {
      repoId,
      mutation: 'CREATED',
      milestone: publication,
    },
  })

  return {
    unresolvedRepoIds,
    publication,
  }
}
