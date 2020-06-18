const {
  getSubscriptionsForUserAndObjects,
  getSimulatedSubscriptionForUserAndObject,
  getUnreadNotificationsForUserAndObject
} = require('../../lib/Subscriptions')
const paginateNotifications = require('../../lib/paginateNotificationConnection')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')

const createSubscriptionConnection = (nodes, args, me) => {
  const connection = paginate(args, nodes)
  if (!Roles.userIsInRoles(me, ['admin', 'editor'])) {
    connection.pageInfo = null
    connection.nodes = []
  }
  return connection
}

// _meta is present on unpublished docs
// { repo { publication { commit { document } } } }
const getRepoIdsForDoc = (doc, includeParents) => ([
  (doc.meta && doc.meta.repoId) || (doc._meta && doc._meta.repoId),
  includeParents && getRepoId(
    (doc.meta && doc.meta.format) || (doc._meta && doc._meta.format)
  ).repoId
].filter(Boolean))

const getTemplate = (doc) =>
  (doc.meta && doc.meta.template) || (doc._meta && doc._meta.template)

module.exports = {
  async subscribedBy (doc, args, context) {
    const { user: me } = context
    const {
      includeParents,
      onlyEligibles
    } = args

    const repoIds = getRepoIdsForDoc(doc, includeParents)

    return createSubscriptionConnection(
      await getSubscriptionsForUserAndObjects(
        null,
        {
          type: 'Document',
          ids: repoIds
        },
        context,
        {
          onlyEligibles
        }
      ),
      args,
      me
    )
  },
  async subscribedByMe (doc, args, context) {
    const { user: me } = context
    const { includeParents, includeAuthors } = args

    if (!me) {
      return null
    }

    const subscriptions = []

    const repoIds = getRepoIdsForDoc(doc, includeParents)

    const docSubscription = await getSubscriptionsForUserAndObjects(
      me.id,
      {
        type: 'Document',
        ids: repoIds
      },
      context,
      {
        includeNotActive: true
      }
    )
      .then(subs => {
        if (subs.length) {
          // with includeParents there are going to be multiple subscriptions
          // as soon as more than just format parents are subscribeable
          return subs[0]
        }
        if (repoIds.length > 1 || getTemplate(doc) === 'format') {
          return getSimulatedSubscriptionForUserAndObject(
            me.id,
            {
              type: 'Document',
              id: repoIds[repoIds.length - 1] // format is always last
            },
            context
          )
        }
      })
    if (docSubscription) {
      subscriptions.push(docSubscription)
    }

    // TODO: reindex all docs to provide authorUserIds?
    if (includeAuthors && doc.meta.authorUserIds) {
      const authorSubscriptions = await getSubscriptionsForUserAndObjects(
        me.id,
        {
          type: 'User',
          ids: doc.meta.authorUserIds
        },
        context,
        {
          includeNotActive: true
        }
      )
      authorSubscriptions.forEach(s => subscriptions.push(s))

      // simulate other author's connections
      const userIds = authorSubscriptions.map(s => s.objectUserId)
      doc.meta.authorUserIds
        .filter(id => !userIds.includes(id))
        .map(id => getSimulatedSubscriptionForUserAndObject(
          me.id,
          {
            type: 'User',
            id
          },
          context
        ))
        .forEach(sub => subscriptions.push(sub))
    }
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
