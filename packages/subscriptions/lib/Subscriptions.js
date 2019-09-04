const { flipKeyValues } = require('@orbiting/backend-modules-utils')

const objectTypes = ({
  'User': 'objectUserId',
  'Document': 'objectDocumentId',
  'Discussion': 'objectDiscussionId'
})

const columnNames = flipKeyValues(objectTypes)

const subscribe = async (args, context) => {
  const { t, pgdb } = context
  const { userId, objectId, type, filters } = args

  if (type !== 'User') {
    throw new Error(t('api/subscriptions/type/notSupported'))
  }

  // TODO upsert
  const subscription = await pgdb.public.subscriptions.insertAndGet({
    userId,
    filters,
    objectType: type,
    [objectTypes[type]]: objectId
  })

  return subscription
}

const getObject = async (subscription, context) => {
  const { loaders, t } = context

  const { objectType: type } = subscription

  if (type !== 'User') {
    throw new Error(t('api/subscriptions/type/notSupported'))
  }

  const userId = subscription[objectTypes[type]]

  // TODO cleanup with type resolver
  const obj = await loaders.User.byId.load(userId)
  return {
    __typename: type,
    ...obj
  }
}

const getSubject = (subscription, context) => {
  const { loaders } = context
  return loaders.User.byId.load(subscription.userId)
}

module.exports = {
  subscribe,
  getObject,
  getSubject
}
