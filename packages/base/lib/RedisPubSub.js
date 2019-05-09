const { RedisPubSub } = require('graphql-redis-subscriptions')
const { withFilter } = require('apollo-server')

const connect = () => {
  const url = process.env.REDIS_URL

  return new RedisPubSub({
    connection: url
  })
}

const disconnect = pubsub => {
  pubsub.getSubscriber().quit()
  return pubsub.getPublisher().quit()
}

// https://github.com/davidyaha/graphql-redis-subscriptions/issues/67
const filtered = (asyncIterator, filter) => withFilter(
  () => asyncIterator,
  filter
)

module.exports = {
  connect,
  disconnect,
  filtered
}
