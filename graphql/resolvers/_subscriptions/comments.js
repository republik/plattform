const { lib: { RedisPubSub: { pubsub, filtered } } } = require('@orbiting/backend-modules-base')

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
