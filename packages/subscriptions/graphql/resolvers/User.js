const {
  getActiveSubscriptionsByUser,
  getActiveSubscribersForObject,
  getActiveSubscriptionByUserForObject
} = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')

const createSubscriptionConnection = (nodes, args, user, me) => {
  const connection = paginate(args, nodes)
  if (!Roles.userIsMe(user, me)) {
    connection.pageInfo = null
    connection.nodes = []
  }
  if (!Roles.userIsMeOrInRoles(user, me, ['admin'])) {
    connection.totalCount = null
  }
  return connection
}

module.exports = {
  async subscribedTo (user, args, context) {
    const { user: me } = context
    return createSubscriptionConnection(
      await getActiveSubscriptionsByUser(user.id, context),
      args,
      user,
      me
    )
  },
  async subscribedBy (user, args, context) {
    const { user: me } = context
    return createSubscriptionConnection(
      await getActiveSubscribersForObject(
        {
          type: 'User',
          id: user.id
        },
        context
      ),
      args,
      user,
      me
    )
  },
  async subscribedByMe (user, args, context) {
    const { user: me } = context
    if (!me) {
      return
    }
    return getActiveSubscriptionByUserForObject(
      me.id,
      {
        type: 'User',
        id: user.id
      },
      context
    )
  }
}
