const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    Roles.ensureUserHasRole(user, 'member')
    return pubsub.asyncIterator('greeting')
  }
}
