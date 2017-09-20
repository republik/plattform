const { ensureUserHasRole } = require('../../../lib/Roles')
const {
  getTopics,
  setTopics
} = require('../../../lib/github')

module.exports = async (
  _,
  { repoId },
  { user, t, redis }
) => {
  ensureUserHasRole(user, 'editor')

  await Promise.all([
    redis.delAsync(`${repoId}/publication`),
    redis.zremAsync('publishedRepoIds', repoId),
    redis.delAsync(`${repoId}/prepublication`),
    redis.zremAsync('prepublishedRepoIds', repoId),
    getTopics(repoId)
      .then(topics => topics
        .filter(topic => topic !== 'published')
        .concat('unpublished')
      )
      .then(topics => setTopics(repoId, topics))
  ])

  return true
}
