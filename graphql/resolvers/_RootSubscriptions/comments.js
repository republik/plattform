const { pubsub, filtered } = require('../../../lib/RedisPubSub')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
module.exports = {
  subscribe: (_, args, { user }) => {
    return filtered(
      pubsub.asyncIterator('comments'),
      ({ comments: { discussionId } }) => (
        discussionId === args.discussionId
      )
    )()
  }
}
