const { Roles: { ensureUserHasRole } } = require('backend-modules-auth')
const {
  deleteRef
} = require('../../../lib/github')

const {
  redlock,
  lockKey,
  refresh: refreshScheduling
} = require('../../../lib/publicationScheduler')

module.exports = async (
  _,
  { repoId },
  { user, t, redis, pubsub }
) => {
  ensureUserHasRole(user, 'editor')

  const scheduledRefs = [
    'scheduled-publication',
    'scheduled-prepublication'
  ]
  const refs = [
    'publication',
    'prepublication',
    ...scheduledRefs
  ]

  const lock = await redlock().lock(lockKey, 1000)
  await Promise.all([
    ...scheduledRefs.map(ref => redis.zremAsync(`repos:scheduledIds`, `repos:${repoId}/${ref}`)),
    ...refs.map(ref => redis.delAsync(`repos:${repoId}/${ref}`)),
    ...refs.map(ref => deleteRef(repoId, `tags/${ref}`, true))
  ])
    .catch(e => {
      console.error('Error: one or more promises failed:')
      console.error(e)
    })
  await refreshScheduling(lock)
  await lock.unlock()
    .catch((err) => {
      console.error(err)
    })

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return true
}
