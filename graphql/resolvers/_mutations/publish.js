const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { descending } = require('d3-array')
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

const { lib: { html: { get: getHTML } } } = require('@orbiting/backend-modules-documents')

module.exports = async (
  _,
  {
    repoId,
    commitId,
    prepublication,
    scheduledAt: _scheduledAt,
    updateMailchimp = false
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
    { oneway: true },
    context
  )
  if (doc.content.meta.template !== 'front' && !doc.content.meta.slug) {
    throw new Error(t('api/publish/document/slug/404'))
  }
  const repoMeta = await getRepoMeta({ id: repoId })
  // prepareMetaForPublish creates missing discussions as a side-effect
  doc.content.meta = await prepareMetaForPublish(
    repoId,
    doc.content.meta,
    repoMeta,
    scheduledAt,
    now,
    context
  )

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
  // deny if published or scheduled-published slug exists
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
  if (!prepublication && !scheduledAt) {
    await handleRedirection(repoId, doc.content.meta, context)
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

  // TODO: move to top to get a potential throw early
  if (updateMailchimp) {
    const { title, emailSubject } = doc.content.meta
    if (!title || !emailSubject) {
      throw new Error('updateMailchimp missing title or subject', { title, emailSubject })
    }
    const campaignKey = `repos:${repoId}/mailchimp/campaignId`
    let campaignId = await redis.getAsync(campaignKey)
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

    const html = getHTML(doc)

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
    ...milestone,
    live: !scheduledAt,
    meta: {
      scheduledAt,
      updateMailchimp
    },
    document: doc.content
  }
}
