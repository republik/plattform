const {
  getUnreadNotificationsForUserAndObject
} = require('../../lib/Subscriptions')
const {
  getSubscriptionsForDoc
} = require('../../lib/Document')
const {
  getRepoIdsForDoc
} = require('@orbiting/backend-modules-documents/lib/meta')
const paginateNotifications = require('../../lib/paginateNotificationConnection')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')

const createSubscriptionConnection = (nodes, args = {}, me) => {
  const connection = paginate(args, nodes)
  if (!Roles.userIsInRoles(me, ['admin', 'editor'])) {
    connection.pageInfo = null
    connection.nodes = []
  }
  return connection
}

module.exports = {
  async subscribedBy (doc, args, context) {
    const { user: me } = context

    if (args.onlyMe) {
      if (!me) {
        return paginate(args, [])
      }

      return paginate(
        args,
        await getSubscriptionsForDoc(
          doc,
          me.id,
          {
            ...args,
            includeNotActive: true,
            simulate: true
          },
          context
        )
      )
    }

    return createSubscriptionConnection(
      await getSubscriptionsForDoc(
        doc,
        null,
        args,
        context
      ),
      args,
      me
    )
  },
  // deprecated use subscribedBy with onlyMe
  async subscribedByMe (doc, args, context) {
    const { user: me } = context

    if (!me) {
      return null
    }

    const subscriptions = await getSubscriptionsForDoc(
      doc,
      me.id,
      {
        ...args,
        includeNotActive: true,
        simulate: true
      },
      context
    )

    return subscriptions && subscriptions[0]
  },
  async unreadNotifications (doc, args, context) {
    const { user: me } = context

    const repoIds = getRepoIdsForDoc(doc, false)
    if (!me || !repoIds || !repoIds.length) {
      return paginateNotifications(args, [])
    }

    return paginateNotifications(
      args,
      await getUnreadNotificationsForUserAndObject(
        me.id,
        {
          type: 'Document',
          id: repoIds[0]
        },
        context
      )
    )
  }
}
