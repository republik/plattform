const { getSubscriptionByUserForObject } = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')

const createSubscriptionConnection = (nodes, args, user, me) => {
  const connection = paginate(args, nodes)
  if (user.id !== me.id) {
    connection.pageInfo = null
    connection.nodes = []
  }
  return connection
}

module.exports = {
  async subscribedTo (user, args, context) {
    const { user: me, loaders: { Subscription } } = context
    return createSubscriptionConnection(
      await Subscription.byUserIdNodes.load(user.id),
      args,
      user,
      me
    )
  },
  async subscribedBy (user, args, context) {
    const { user: me, loaders: { Subscription } } = context
    return createSubscriptionConnection(
      await Subscription.byObjectUserIdNodes.load(user.id),
      args,
      user,
      me
    )
  },
  async subscribedByMe (user, args, context) {
    const { user: me } = context
    return getSubscriptionByUserForObject(
      me.id,
      'User',
      user.id,
      context
    )
  }
}
