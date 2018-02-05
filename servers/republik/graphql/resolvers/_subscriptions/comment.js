const { pubsub, filtered } = require('@orbiting/backend-modules-base/lib/RedisPubSub')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
module.exports = {
  subscribe: (_, args, { user }) => {
    return filtered(
      pubsub.asyncIterator('comment'),
      (update) =>
        update.comment.node.discussionId === args.discussionId
    )()
  }
}
