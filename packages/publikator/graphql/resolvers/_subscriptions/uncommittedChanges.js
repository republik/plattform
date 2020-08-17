const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
// TODO
// test filtering with asyncIterator
// why is variables undefined?
module.exports = {
  subscribe: (_, args, { user, pubsub }) => {
    ensureUserHasRole(user, 'editor')
    return filtered(
      pubsub.asyncIterator('uncommittedChanges'),
      ({ uncommittedChanges: { repoId } }, variables) => (
        repoId === args.repoId
      )
    )()
  }
}
