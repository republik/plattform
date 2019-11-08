const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

const { deleteRef } = require('../../../lib/github')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../Repo')
const { upsert: repoCacheUpsert } = require('../../../lib/cache/upsert')

const { DISABLE_PUBLISH } = process.env

module.exports = async (
  _,
  { repoId },
  context
) => {
  const { user, t, redis, pubsub, elastic } = context
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

  await repoCacheUpsert({
    id: repoId,
    meta: await getRepoMeta({ id: repoId }),
    publications: await getLatestPublications({ id: repoId })
  }, context)

  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId
    }
  })

  return true
}
