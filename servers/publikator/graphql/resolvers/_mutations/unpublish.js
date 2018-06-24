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

  await Promise.all(
    refs.map(ref => deleteRef(repoId, `tags/${ref}`, true))
  )
    .catch(e => {
      console.error('Error: could not delete ref on github')
      console.error(e)
    })

  const { lib: { Documents: { unpublish } } } =
    require('@orbiting/backend-modules-search')

  await unpublish(elastic, redis, repoId)

  await redis.publishAsync(channelKey, 'refresh')

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return true
}
