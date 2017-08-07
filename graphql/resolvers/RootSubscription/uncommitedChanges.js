const {pubsub, filtered} = require('../../../lib/RedisPubSub')

// filtering with asyncIterator -> filtered by redis
// filtering with payload, variables -> filtered by node
// TODO
// test filtering with asyncIterator
// why is variables undefined?
module.exports = {
  subscribe: (_, args) => filtered(
    pubsub.asyncIterator('uncommitedChanges'),
    ({uncommitedChanges: {login, repository, path}}, variables) => (
      login === args.login && repository === args.repository && path === args.path
    )
  )()
}
