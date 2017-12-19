const { lib: { RedisPubSub: { pubsub } } } = require('@orbiting/backend-modules-base')
const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  subscribe: (_, args, { user }) => {
    Roles.ensureUserHasRole(user, 'member')
    return pubsub.asyncIterator('greeting')
  }
}
