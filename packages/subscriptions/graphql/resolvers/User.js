const {
  getSubscriptionsForUser,
  getSubscriptionsForUserAndObject,
  getSimulatedSubscriptionForUserAndObject
} = require('../../lib/Subscriptions')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')

const createSubscriptionConnection = (nodes, args, user, me) => {
  const connection = paginate(args, nodes)
  if (!Roles.userIsMe(user, me)) {
    connection.pageInfo = null
    connection.nodes = connection.nodes.filter(n =>
      n.userId === me.id || n.objectUserId === me.id
    )
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
        .then(
          subs => objectType
            ? subs.filter(sub => sub.objectType === objectType)
            : subs
        ),
      args,
      user,
      me
    )
  },
  async subscribedBy (user, args, context) {
    const { user: me } = context
    return createSubscriptionConnection(
      await getSubscriptionsForUserAndObject(
        args.onlyMe ? me.id : null,
        {
          type: 'User',
          id: user.id
        },
        context,
        {
          includeNotActive: args.onlyMe
        }
      ).then(subs => {
        if (!subs.length && args.onlyMe) {
          return [getSimulatedSubscriptionForUserAndObject(
            me.id,
            {
              type: 'User',
              id: user.id
            },
            context
          )]
        }
        return subs
      }),
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
    ).then(subs => {
      if (!subs.length) {
        return getSimulatedSubscriptionForUserAndObject(
          me.id,
          {
            type: 'User',
            id: user.id
          },
          context
        )
      }
      return subs[0]
    })
  }
}
