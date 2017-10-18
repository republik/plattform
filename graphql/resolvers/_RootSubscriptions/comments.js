const { pubsub, filtered } = require('../../../lib/RedisPubSub')
const { ensureUserHasRole } = require('../../../lib/Roles')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
module.exports = {
  subscribe: (_, args, { user }) => {
    ensureUserHasRole(user, 'member')
    return filtered(
      pubsub.asyncIterator('comments'),
      ({ comments: { discussionId } }) => (
        discussionId === args.discussionId
      )
    )()
  }
}
