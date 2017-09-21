const { ensureUserHasRole } = require('../../../lib/Roles')
const { descending } = require('d3-array')
const yaml = require('../../../lib/yaml')
const {
  createGithubClients,
  publicationVersionRegex,
  getAnnotatedTags,
  upsertRef
} = require('../../../lib/github')

const placeMilestone = require('./placeMilestone')
const { document: getDocument } = require('../Commit')

// TODO updateMailchimp
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
  await upsertRef(
    repoId,
    `tags/${ref}`,
    milestone.sha
  )
  // remove old scheduled ref
  if (!scheduledAt) {
    await upsertRef(
      repoId,
      `tags/scheduled-${ref}`,
      milestone.sha
    )
  }

  // get doc
  const doc = await getDocument(
    { id: commitId, repo: { id: repoId } },
    null,
    { user }
  )
    .then(doc => JSON.stringify(doc))

  // cache in redis
  const scheduledKey = prepublication
    ? `${repoId}/scheduledPrepublication`
    : `${repoId}/scheduledPublication`
  const scheduledListKey = prepublication
    ? `scheduledPrepublicationRepoIds`
    : `scheduledPublicationRepoIds`

  if (!scheduledAt) {
    let keys = [ `${repoId}/prepublication` ]
    let listKeys = [ 'prepublishedRepoIds' ]

    if (!prepublication) {
      keys.push(`${repoId}/publication`)
      listKeys.push('publishedRepoIds')
    }

    const nowTimestamp = now.getTime()
    await Promise.all([
      ...keys.map(key => redis.setAsync(key, doc)),
      ...listKeys.map(key => redis.zaddAsync(key, nowTimestamp, repoId)),
      // overwrite previous scheduling
      redis.delAsync(scheduledKey, doc),
      redis.zremAsync(scheduledListKey, repoId)
    ])
  } else {
    await Promise.all([
      redis.setAsync(scheduledKey, doc),
      redis.zaddAsync(scheduledListKey, scheduledAt.getTime(), repoId)
    ])
  }
  // TODO refresh scheduling

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

  /*
  // toggle published / unpublished
  // this is optional, the topics are not read back again
  if (!prepublication) {
    await getTopics(repoId)
      .then(topics => topics
        .filter(topic => topic !== 'unpublished')
        .concat('published')
      )
      .then(topics => setTopics(repoId, topics))
  }
  */
  return {
    ...milestone,
    meta: {
      scheduledAt,
      updateMailchimp
    }
  }
}
