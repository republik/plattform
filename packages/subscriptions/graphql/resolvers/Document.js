const {
  getSubscriptionsForUserAndObjects,
  getSimulatedSubscriptionForUserAndObject,
  getUnreadNotificationsForUserAndObject
} = require('../../lib/Subscriptions')
const paginateNotifications = require('../../lib/paginateNotificationConnection')
const { paginate } = require('@orbiting/backend-modules-utils')
const { Roles } = require('@orbiting/backend-modules-auth')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')
const { v4: isUuid } = require('is-uuid')
const Promise = require('bluebird')

const createSubscriptionConnection = (nodes, args = {}, me) => {
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
  doc.meta?.repoId || doc._meta?.repoId,
  includeParents && getRepoId(
    doc.meta?.format || doc._meta?.format
  ).repoId
].filter(Boolean))

const getTemplate = (doc) =>
  doc.meta?.template || doc._meta?.template

const getAuthorUserIds = (doc, { loaders }) =>
  Promise.map(
    (doc.meta?.credits || doc._meta?.credits)
      .filter(c => c.type === 'link'),
    async ({ url }) => {
      if (url.startsWith('/~')) {
        const idOrUsername = url.substring(2)
        if (isUuid(idOrUsername)) {
          return idOrUsername
        } else {
          return loaders.User.byUsername.load(idOrUsername)
            .then(u => u?.id)
        }
      } else {
        console.warn(`invalid author link encountered: ${url}`)
      }
    }
  )
    .then(userIds => userIds.filter(Boolean))

const getSubscriptionsForDoc = async (
  doc,
  userId,
  {
    onlyEligibles = false,
    includeParents = false,
    includeNotActive = false,
    uniqueUsers = false,
    simulate = false,
  },
  context
) => {
  const subscriptions = []

  const repoIds = getRepoIdsForDoc(doc, includeParents)

  const docSubscription = await getSubscriptionsForUserAndObjects(
    userId,
    {
      type: 'Document',
      ids: repoIds
    },
    context,
    {
      onlyEligibles,
      includeParents,
      includeNotActive
    }
  )
    .then(subs => {
      if (subs.length) {
        // with includeParents there are going to be multiple subscriptions
        // as soon as more than just format parents are subscribeable
        return subs[0]
      }
      if (simulate && (repoIds.length > 1 || getTemplate(doc) === 'format')) {
        return getSimulatedSubscriptionForUserAndObject(
          userId,
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

  const authorUserIds = await getAuthorUserIds(doc, context)
  if (authorUserIds.length) {
    const authorSubscriptions = await getSubscriptionsForUserAndObjects(
      userId,
      {
        type: 'User',
        ids: authorUserIds
      },
      context,
      {
        onlyEligibles,
        includeParents,
        includeNotActive
      }
    )
    authorSubscriptions.forEach(s => subscriptions.push(s))

    if (simulate) {
      const userIds = authorSubscriptions.map(s => s.objectUserId)
      authorUserIds
        .filter(id => !userIds.includes(id))
        .map(id => getSimulatedSubscriptionForUserAndObject(
          userId,
          {
            type: 'User',
            id
          },
          context
        ))
        .forEach(sub => subscriptions.push(sub))
    }
  }

  if (uniqueUsers) {
    return subscriptions
      .filter( (sub1, index1, arr) =>
        arr.findIndex( (sub2, index2) => sub2.userId === sub1.userId && index2 < index1) === -1
      )
  }
  return subscriptions
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

    // TODO SubscriptionConnection instead of Subscription in FE
    return subscriptions[0]
    //return paginate(args, subscriptions)
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
