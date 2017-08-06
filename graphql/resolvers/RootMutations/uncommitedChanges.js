module.exports = async (_, {owner, name, path, action}, {user, redis, pubsub}) => {
  const key = `${owner}/${name}/${path}`
  const now = new Date().getTime()
  let result
  if (action === 'create') {
    result = await redis.zaddAsync(key, now, user.id)
  } else if (action === 'delete') {
    result = await redis.zremAsync(key, user.id)
  }
  if (result) {
    await pubsub.publish('uncommitedChanges', { uncommitedChanges: { owner, name, path, user, action } })
  }
  return result
}
