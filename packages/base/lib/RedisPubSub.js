const { RedisPubSub } = require('graphql-redis-subscriptions')
const { withFilter } = require('apollo-server')
const { getConnectionOptions } = require('./Redis')

const connect = () =>
  new RedisPubSub({
    connection: getConnectionOptions(),
  })

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
