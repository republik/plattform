const { filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    ensureUserHasRole(user, 'member')
    return filtered(
      pubsub.asyncIterator('notification'),
      (update) =>
        update.notification.userId === user.id
    )()
  }
}
