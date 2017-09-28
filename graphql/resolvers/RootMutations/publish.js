const { ensureUserHasRole } = require('../../../lib/Roles')
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

const { renderEmail } = require('../../../lib/Templates/email')
const newsletterEmail = require('../../../lib/Templates/NewsletterEmail').default

module.exports = async (
  _,
  {
    repoId,
    commitId,
    prepublication,
    scheduledAt: _scheduledAt,
    updateMailchimp = false
  },
  { user, t, redis }
) => {
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()
  const now = new Date()

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
      user
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
  const doc = await getDocument(
    { id: commitId, repo: { id: repoId } },
    null,
    { user }
  )
  const payload = JSON.stringify({
    doc,
    sha: milestone.sha
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

  if (updateMailchimp) {
    const { content, meta: { title, emailSubject, slug } } = doc
    // TODO proper error handling
    if (!title || !emailSubject || !slug) {
      throw new Error('updateMailchimp missing one or more params', { title, emailSubject, slug })
    }
    const campaignKey = `repos:${repoId}/mailchimp/campaignId`
    let campaignId = await redis.getAsync(campaignKey)
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
    }
    const html = renderEmail(content, newsletterEmail)
    const updateResponse = await updateCampaignContent({
      campaignId,
      html
    })
    if (updateResponse.status) {
      throw new Error('Mailchimp: could not update campaign', updateResponse)
    }
  }

  return {
    ...milestone,
    live: !scheduledAt,
    meta: {
      scheduledAt,
      updateMailchimp
    }
  }
}
