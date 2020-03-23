const { filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')
const { ensureUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    ensureUser(user)
    return filtered(
      pubsub.asyncIterator('notification'),
      (update) =>
        update.notification.userId === user.id
    )()
  }
}
