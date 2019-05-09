const { filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    ensureUserHasRole(user, 'member')
    return filtered(
      pubsub.asyncIterator('webNotification'),
      (update) =>
        update.webNotification.userIds.indexOf(user.id) > -1
    )()
  }
}
