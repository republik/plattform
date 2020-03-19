const {
  getActiveSubscriptionsForUser,
  getActiveSubscriptionsForUserAndObject
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
      await getActiveSubscriptionsForUser(user.id, context),
      args,
      user,
      me
    )
  },
  async subscribedBy (user, args, context) {
    const { user: me } = context
    return createSubscriptionConnection(
      await getActiveSubscriptionsForUserAndObject(
        null,
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
    return getActiveSubscriptionsForUserAndObject(
      me.id,
      {
        type: 'User',
        id: user.id
      },
      context
    )
      .then(res => res[0])
  }
}
