const { Subscriptions } = require('@orbiting/backend-modules-subscriptions')

const { sendNotification } = require('@orbiting/backend-modules-subscriptions')

const {
  FRONTEND_BASE_URL
} = process.env

const notifyPublish = async (repoId, context) => {
  const {
    loaders
  } = context

  const doc = await loaders.Document.byRepoId.load(repoId)
  const docRepoId = doc.meta.repoId

  // eg. https://github.com/republik/format-aus-der-redaktion
  const formatRepoId = doc.meta.format && doc.meta.format.split('github.com/')[1]
  if (!formatRepoId) {
    return
  }

  const subscriptionDoc = await loaders.Document.byRepoId.load(formatRepoId)
  const subscriptionRepoId = subscriptionDoc.meta.repoId

  const subscribers = await Subscriptions.getSubscribersForObject(
    'Document',
    subscriptionRepoId,
    'Document',
    context
  )
  console.log({ subscribers })

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
            title: 'Neues Dokument publiziert',
            body: `${doc.meta.title}`,
            url: `${FRONTEND_BASE_URL}${doc.meta.path}`,
            type: 'document',
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
