const { lib: { RedisPubSub: { pubsub, filtered } } } = require('@orbiting/backend-modules-base')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

module.exports = {
  subscribe: (_, args, { user }) => {
    ensureUserHasRole(user, 'editor')
    return filtered(
      pubsub.asyncIterator('repoUpdate'),
      ({ repoUpdate: { id } }, variables) => (
        !args.repoId || id === args.repoId
      )
    )()
  }
}
