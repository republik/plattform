module.exports = async (
  _,
  { repoId, action },
  { user, redis, pubsub }
) => {
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
