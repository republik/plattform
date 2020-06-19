const {
  Subscriptions: {
    getSubscriptionsForUserAndObject,
    getSubscriptionsForUserAndObjects
  }
} = require('@orbiting/backend-modules-subscriptions')
const { sendNotification } = require('@orbiting/backend-modules-subscriptions')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')
const { inQuotes } = require('@orbiting/backend-modules-styleguide')
const Promise = require('bluebird')

const {
  FRONTEND_BASE_URL
} = process.env

const getFormatSubscriptions = async (doc, formatDoc, context) => {
  if (!formatDoc) {
    return
  }

  return getSubscriptionsForUserAndObject(
    null,
    {
      type: 'Document',
      id: formatDoc.meta.repoId
    },
    context,
    {
      onlyEligibles: true
    }
  )
}

const getAuthorSubscriptions = (doc, context) => {
  const { authorUserIds } = doc.meta
  if (!authorUserIds) {
    return
  }

  return getSubscriptionsForUserAndObjects(
    null,
    {
      type: 'User',
      ids: authorUserIds,
      filter: 'Document'
    },
    context,
    {
      onlyEligibles: true
    }
  )
}

const getUsersWithSubscriptions = (subscriptions = [], { loaders }) => {
  return Promise.map(
    subscriptions,
    async (sub) => ({
      ...await loaders.User.byId.load(sub.userId),
      __subscription: sub
    })
  )
}

const notifyPublish = async (repoId, context, testUsers) => {
  const {
    loaders,
    t
  } = context

  if (testUsers && !Array.isArray(testUsers)) {
    throw new Error(t('api/unexpected'))
  }

  const doc = await loaders.Document.byRepoId.load(repoId)
  const docRepoId = doc.meta.repoId

  const { repoId: formatRepoId } = getRepoId(doc.meta.format)
  const formatDoc = formatRepoId && await loaders.Document.byRepoId.load(formatRepoId)

  const [formatSubscriptions, authorsSubscriptions] = testUsers ? [] : await Promise.all([
    getFormatSubscriptions(doc, formatDoc, context),
    getAuthorSubscriptions(doc, context)
  ])

  const formatSubscribers = testUsers ||
    await getUsersWithSubscriptions(formatSubscriptions, context)

  const eventInfo = {
    objectType: 'Document',
    objectId: docRepoId
  }
  const appContent = {
    body: doc.meta.shortTitle || [doc.meta.title, doc.meta.description].join(' - '),
    url: `${FRONTEND_BASE_URL}${doc.meta.path}`,
    // change when APP allows to open url of other types
    // https://github.com/orbiting/app/blob/master/src/services/pushNotificationsProvider.ios.js#L59
    type: 'discussion',
    tag: docRepoId
  }
  let event
  if (formatSubscribers.length) {
    event = await sendNotification(
      {
        event: eventInfo,
        users: formatSubscribers,
        content: {
          app: {
            ...appContent,
            title: t('api/notifications/doc/title', { title: inQuotes(formatDoc.meta.title) })
          }
        }
      },
      context
    )
  }

  const notifiedUserIds = formatSubscribers.map(user => user.id)
  const dedupedAuthorsSubscriptions = authorsSubscriptions
    .filter(sub => !notifiedUserIds.includes(sub.userId))

  if (dedupedAuthorsSubscriptions.length) {
    const authorsSubscribers =
      await getUsersWithSubscriptions(dedupedAuthorsSubscriptions, context)

    const authorSubscribersByAuthorIds = authorsSubscribers.reduce(
      (agg, user) => {
        const { objectUserId: authorId } = user.__subscription
        if (agg[authorId]) {
          agg[authorId].push(user)
        } else {
          agg[authorId] = [user]
        }
        return agg
      }, {}
    )

    await Promise.each(
      Object.keys(authorSubscribersByAuthorIds),
      async (authorId) => {
        const author = await loaders.User.byId.load(authorId)
        const subscribers = authorSubscribersByAuthorIds[authorId]

        event = await sendNotification(
          {
            event: event ? { id: event.id } : eventInfo,
            users: subscribers,
            content: {
              app: {
                ...appContent,
                title: t('api/notifications/doc/author/title', { name: author.name })
              }
            }
          },
          context
        )
      }
    )
  }
}

module.exports = {
  notifyPublish
}
