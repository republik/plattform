const { ensureUserHasRole } = require('../../../lib/Roles')
const { descending } = require('d3-array')
const yaml = require('../../../lib/yaml')
const {
  createGithubClients,
  publicationVersionRegex,
  getAnnotatedTags,
  setTopics,
  getTopics
} = require('../../../lib/github')

const placeMilestone = require('./placeMilestone')
const { document: getDocument } = require('../Commit')

// TODO updateMailchimp
// TODO scheduledAt
module.exports = async (
  _,
  { repoId, commitId, prepublication, scheduledAt, updateMailchimp = false },
  { user, t, redis }
) => {
  ensureUserHasRole(user, 'editor')
  const { githubRest } = await createGithubClients()

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

  // publish to redis
  const doc = await getDocument(
    { id: commitId, repo: { id: repoId } },
    null,
    { user }
  )
    .then(doc => JSON.stringify(doc))

  const now = new Date().getTime()
  let operations = [
    redis.setAsync(
      `${repoId}/prepublication`,
      doc
    ),
    redis.zaddAsync(
      'prepublishedRepoIds',
      now,
      repoId
    )
  ]
  if (!prepublication) {
    operations = operations.concat([
      redis.setAsync(
        `${repoId}/publication`,
        doc
      ),
      redis.zaddAsync(
        'publishedRepoIds',
        now,
        repoId
      )
    ])
  }
  await Promise.all(operations)

  // toggle published / unpublished
  if (!prepublication) {
    await getTopics(repoId)
      .then(topics => topics
        .filter(topic => topic !== 'unpublished')
        .concat('published')
      )
      .then(topics => setTopics(repoId, topics))
  }

  return {
    ...milestone,
    meta: {
      scheduledAt,
      updateMailchimp
    }
  }
}
