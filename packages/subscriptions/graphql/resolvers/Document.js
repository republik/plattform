const {
  getUnreadNotificationsForUserAndObject
} = require('../../lib/Subscriptions')
const {
  getSubscriptionsForDoc,
  getRepoIdsForDoc
} = require('../../lib/Document')
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

    return createSubscriptionConnection(
      await getSubscriptionsForDoc(
        doc,
        null,
        args,
        context,
      ),
      args,
      me
    )
  },
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

    return paginate(args, subscriptions)
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
