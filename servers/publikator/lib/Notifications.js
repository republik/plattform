const {
  Subscriptions: {
    getSubscriptionsForUserAndObject
  }
} = require('@orbiting/backend-modules-subscriptions')
const { sendNotification } = require('@orbiting/backend-modules-subscriptions')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')
const { inQuotes } = require('@project-r/styleguide/lib/lib/inQuotes')
const Promise = require('bluebird')

const {
  FRONTEND_BASE_URL
} = process.env

const notifyPublish = async (repoId, context, testUsers) => {
  const {
    loaders,
    t
  } = context

  const doc = await loaders.Document.byRepoId.load(repoId)
  const docRepoId = doc.meta.repoId

  const { repoId: formatRepoId } = getRepoId(doc.meta.format)
  if (!formatRepoId) {
    return
  }

  const subscriptionDoc = await loaders.Document.byRepoId.load(formatRepoId)
  const subscriptionRepoId = subscriptionDoc.meta.repoId

  const subscriptions = testUsers
    ? null
    : await getSubscriptionsForUserAndObject(
      null,
      {
        type: 'Document',
        id: subscriptionRepoId
      },
      context,
      {
        onlyEligibles: true
      }
    )
  const subscribers = testUsers || await Promise.map(
    subscriptions,
    async (sub) => ({
      ...await loaders.User.byId.load(sub.userId),
      __subscription: sub
    })
  )

  if (subscribers.length > 0) {
    await sendNotification(
      {
        subscription: {
          objectType: 'Document',
          objectId: subscriptionRepoId
        },
        event: {
          objectType: 'Document',
          objectId: docRepoId
        },
        users: subscribers,
        content: {
          app: {
            title: t('api/notifications/doc/title', { title: inQuotes(subscriptionDoc.meta.title) }),
            body: doc.meta.shortTitle || [doc.meta.title, doc.meta.description].join(' - '),
            url: `${FRONTEND_BASE_URL}${doc.meta.path}`,
            // change when APP allows to open url of other types
            // https://github.com/orbiting/app/blob/master/src/services/pushNotificationsProvider.ios.js#L59
            type: 'discussion',
            tag: docRepoId
          }
        }
      },
      context
    )
  }
}

module.exports = {
  notifyPublish
}
