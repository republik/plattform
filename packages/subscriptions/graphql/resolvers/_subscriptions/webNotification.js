const { filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')
const { ensureUser } = require('@orbiting/backend-modules-auth')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    ensureUser(user)
    return filtered(
      pubsub.asyncIterator('webNotification'),
      (update) => update.userIds.indexOf(user.id) > -1,
    )()
  },
}
