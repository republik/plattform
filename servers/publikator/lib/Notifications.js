const {
  Document: {
    getSubscriptionsForDoc,
  }
} = require('@orbiting/backend-modules-subscriptions')
const { sendNotification } = require('@orbiting/backend-modules-subscriptions')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')
const { inQuotes } = require('@orbiting/backend-modules-styleguide')
const Promise = require('bluebird')

const {
  FRONTEND_BASE_URL
} = process.env

const getUsersWithSubscriptions = (subscriptions = [], { loaders }) => {
  return Promise.map(
    subscriptions,
    async (sub) => ({
      ...await loaders.User.byId.load(sub.userId),
      __subscription: sub
    })
  )
}

const groupSubscribersByObjectId = (subscribers, key) => subscribers.reduce(
  (agg, user) => {
    const objectId = user.__subscription[key]
    if (agg[objectId]) {
      agg[objectId].push(user)
    } else {
      agg[objectId] = [user]
    }
    return agg
  }, {}
)

const notifyPublish = async (repoId, context, testUser) => {
  const {
    loaders,
    t
  } = context

  if (testUser && !testUser.id) {
    throw new Error(t('api/unexpected'))
  }

  const doc = await loaders.Document.byRepoId.load(repoId)
  const docRepoId = doc.meta.repoId

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

  const docsSubscriptions = []
  const authorsSubscriptions = []
  await getSubscriptionsForDoc(
    doc,
    testUser?.id, //otherwise null => for all users
    {
      ...testUser ? {
        simulate: true,
        onlyEligibles: false,
        includeNotActive: true,
        uniqueUsers: false
      } : {
        onlyEligibles: true,
        includeParents: true,
        uniqueUsers: true,
      }
    },
    context
  ).then( subs => subs.forEach( sub => {
    if (sub.objectType === 'Document') {
      docsSubscriptions.push(sub)
    } else {
      authorsSubscriptions.push(sub)
    }
  }))

  let event

  const docsSubscribers = await getUsersWithSubscriptions(docsSubscriptions, context)
  const docSubscribersByDocId = groupSubscribersByObjectId(docsSubscribers, 'objectDocumentId')

  await Promise.each(
    Object.keys(docSubscribersByDocId),
    async (docId) => {
      const subscribedDoc = await loaders.Document.byRepoId.load(docId)
      const subscribers = docSubscribersByDocId[docId]
      console.log({type: 'doc', subscribers,
        title: t('api/notifications/doc/title', { title: inQuotes(subscribedDoc.meta.title) })
      })

      event = await sendNotification(
        {
          event: event ? { id: event.id } : eventInfo,
          users: subscribers,
          content: {
            app: {
              ...appContent,
              title: t('api/notifications/doc/title', { title: inQuotes(subscribedDoc.meta.title) })
            }
          }
        },
        context
      )
    }
  )

  const authorsSubscribers = await getUsersWithSubscriptions(authorsSubscriptions, context)
  const authorSubscribersByAuthorId = groupSubscribersByObjectId(authorsSubscribers, 'objectUserId')

  await Promise.each(
    Object.keys(authorSubscribersByAuthorId),
    async (authorId) => {
      const author = await loaders.User.byId.load(authorId)
      const subscribers = authorSubscribersByAuthorId[authorId]
      console.log({type: 'author', subscribers,
        title: t('api/notifications/doc/author/title', { name: author.name })
      })

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

module.exports = {
  notifyPublish
}
