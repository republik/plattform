const { pubsub, filtered } = require('../../../lib/RedisPubSub')
const { Roles: { ensureUserHasRole } } = require('backend-modules-auth')

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
