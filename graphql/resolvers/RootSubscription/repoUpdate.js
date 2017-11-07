const { pubsub, filtered } = require('../../../lib/RedisPubSub')
const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = {
  subscribe: (_, args, { user }) => {
    ensureUserHasRole(user, 'editor')
    return filtered(
      pubsub.asyncIterator('repoUpdate'),
      ({ repoUpdate: { id } }, variables) => (
        id === args.repoId
      )
    )()
  }
}
