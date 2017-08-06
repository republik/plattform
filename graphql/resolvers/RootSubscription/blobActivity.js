const {pubsub, filtered} = require('../../RedisPubSub')

module.exports = {
  subscribe: (_, args) => filtered(
    pubsub.asyncIterator(`blobActivity`),
    (payload, variables) => true
  )()
}
