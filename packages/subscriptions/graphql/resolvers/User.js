const {
  getSubscriptionsForUser,
  getSubscriptionsForUserAndObject
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
    const { objectType } = args
    return createSubscriptionConnection(
      await getSubscriptionsForUser(user.id, context)
        .then(subs => {
          return objectType
            ? subs.filter(sub => sub.objectType === objectType)
            : subs
        }),
      args,
      user,
      me
    )
  },
  async subscribedBy (user, args, context) {
    const { user: me } = context
    return createSubscriptionConnection(
      await getSubscriptionsForUserAndObject(
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
    return getSubscriptionsForUserAndObject(
      me.id,
      {
        type: 'User',
        id: user.id
      },
      context,
      {
        includeNotActive: true
      }
    )
      .then(res => res[0])
  }
}
