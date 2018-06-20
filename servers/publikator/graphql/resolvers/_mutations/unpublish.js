const elastic = require('@orbiting/backend-modules-base/lib/elastic').client()

const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

const {
  deleteRef
} = require('../../../lib/github')

const { channelKey } = require('../../../lib/publicationScheduler')

const { DISABLE_PUBLISH } = process.env

module.exports = async (
  _,
  { repoId },
  { user, t, redis, pubsub }
) => {
  ensureUserHasRole(user, 'editor')

  if (DISABLE_PUBLISH) {
    throw new Error(t('api/publish/disabled'))
  }

  const scheduledRefs = [
    'scheduled-publication',
    'scheduled-prepublication'
  ]
  const refs = [
    'publication',
    'prepublication',
    ...scheduledRefs
  ]

  // const lock = await redlock().lock(lockKey, 1000)
  await Promise.all([
    ...scheduledRefs.map(ref => redis.zremAsync(`repos:scheduledIds`, `repos:${repoId}/${ref}`)),
    ...refs.map(ref => redis.delAsync(`repos:${repoId}/${ref}`)),
    ...refs.map(ref => deleteRef(repoId, `tags/${ref}`, true))
  ])
    .catch(e => {
      console.error('Error: one or more promises failed:')
      console.error(e)
    })

  const { lib: { Documents: { unpublish } } } =
    require('@orbiting/backend-modules-search')

  await unpublish(elastic, repoId)

  await redis.publishAsync(channelKey, 'refresh')

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return true
}
