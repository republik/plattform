const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')

module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    ensureUserHasRole(user, 'editor')
    return filtered(
      pubsub.asyncIterator('repoUpdate'),
      ({ repoUpdate: { id } }, variables) => (
        !args.repoId || id === args.repoId
      )
    )()
  }
}
