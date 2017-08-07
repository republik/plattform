module.exports = async (_, {login, repository, path, action}, {user, redis, pubsub}) => {
  const key = `${login}/${repository}/${path}`
  const now = new Date().getTime()
  let result
  if (action === 'create') {
    result = await redis.zaddAsync(key, now, user.id)
  } else if (action === 'delete') {
    result = await redis.zremAsync(key, user.id)
  }
  if (result) {
    await pubsub.publish('uncommittedChanges', { uncommittedChanges: { login, repository, path, user, action } })
  }
  return result
}
