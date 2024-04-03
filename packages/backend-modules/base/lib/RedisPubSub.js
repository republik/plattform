const { RedisPubSub } = require('graphql-redis-subscriptions')
const { withFilter } = require('graphql-subscriptions')

const { connect: connectRedis } = require('./Redis')

const connect = () => {
  return new RedisPubSub({
    publisher: connectRedis(),
    subscriber: connectRedis(),
  })
}

const disconnect = (pubsub) => {
  pubsub.getSubscriber().quit()
  return pubsub.getPublisher().quit()
}

// https://github.com/davidyaha/graphql-redis-subscriptions/issues/67
const filtered = (asyncIterator, filter) =>
  withFilter(() => asyncIterator, filter)

module.exports = {
  connect,
  disconnect,
  filtered,
}
