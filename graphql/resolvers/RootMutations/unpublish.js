const { ensureUserHasRole } = require('../../../lib/Roles')
const {
  deleteRef
} = require('../../../lib/github')

module.exports = async (
  _,
  { repoId },
  { user, t, redis }
) => {
  ensureUserHasRole(user, 'editor')

  const keys = [
    `${repoId}/publication`,
    `${repoId}/prepublication`,
    `${repoId}/scheduledPublication`,
    `${repoId}/scheduledPrepublication`
  ]
  const listKeys = [
    'publishedRepoIds',
    'prepublishedRepoIds',
    'scheduledPublicationRepoIds',
    'scheduledPrepublicationRepoIds'
  ]
  const refs = [
    'publication',
    'prepublication',
    'scheduled-publication',
    'scheduled-prepublication'
  ]

  await Promise.all([
    ...keys.map(key => redis.delAsync(key)),
    ...listKeys.map(key => redis.zremAsync(key, repoId)),
    ...refs.map(ref => deleteRef(repoId, `tags/${ref}`))
  ])

  return true
}
