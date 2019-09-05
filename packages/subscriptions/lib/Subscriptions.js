const objectTypes = ({
  'User': 'objectUserId',
  'Document': 'objectDocumentId',
  'Discussion': 'objectDiscussionId'
})

const upsertSubscription = async (args, context) => {
  const { pgdb } = context
  const { userId, objectId, type, filters } = args

  const findProps = {
    userId,
    objectType: type,
    [objectTypes[type]]: objectId
  }
  const updateProps = {
    ...filters ? { filters } : {}
  }

  const existingSubscription = await pgdb.public.subscriptions.findOne(findProps)

  let subscription
  if (existingSubscription) {
    subscription = await pgdb.public.subscriptions.updateAndGetOne(
      { id: existingSubscription.id },
      {
        ...updateProps,
        updatedAt: new Date()
      }
    )
  } else {
    subscription = await pgdb.public.subscriptions.insertAndGet({
      ...findProps,
      ...updateProps
    })
  }

  return subscription
}

const getObject = async (subscription, context) => {
  const { loaders, t } = context

  const { objectType: type } = subscription

  if (type !== 'User') {
    throw new Error(t('api/subscriptions/type/notSupported'))
  }

  const userId = subscription[objectTypes[type]]

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
  upsertSubscription,
  getObject,
  getSubject
}
