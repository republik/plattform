const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

module.exports = async (
  _,
  { repoId, action },
  { user, redis, pubsub }
) => {
  ensureUserHasRole(user, 'editor')

  const now = new Date().getTime()

  let result
  if (action === 'create') {
    result = await redis.zaddAsync(repoId, now, user.id)
  } else if (action === 'delete') {
    result = await redis.zremAsync(repoId, user.id)
  }
  if (result) {
    await pubsub.publish(
      'uncommittedChanges',
      {
        uncommittedChanges: {
          repoId,
          user,
          action
        }
      }
    )
  }
  return result
}
