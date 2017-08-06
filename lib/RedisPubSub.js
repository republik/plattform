const { RedisPubSub } = require('graphql-redis-subscriptions')
const { withFilter } = require('graphql-subscriptions')

const pubsub = new RedisPubSub()

// https://github.com/davidyaha/graphql-redis-subscriptions/issues/67
const filtered = (asyncIterator, filter) => withFilter(
  () => asyncIterator,
  filter
)

module.exports = {pubsub, filtered}
