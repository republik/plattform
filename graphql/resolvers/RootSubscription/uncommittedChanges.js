const {pubsub, filtered} = require('../../../lib/RedisPubSub')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
// TODO
// test filtering with asyncIterator
// why is variables undefined?
module.exports = {
  subscribe: (_, args) => filtered(
    pubsub.asyncIterator('uncommittedChanges'),
    ({ uncommittedChanges: { repoId } }, variables) => (
      repoId === args.repoId
    )
  )()
}
