const objectTypes = ({
  'User': 'objectUserId',
  'Document': 'objectDocumentId',
  'Discussion': 'objectDiscussionId'
})

const upsertSubscription = async (args, context) => {
  const { pgdb, t } = context
  const { userId, objectId, type, filters } = args

  if (type === 'User' && userId === objectId) {
    throw new Error(t('api/subscriptions/notYourself'))
  }

  const findProps = {
    userId,
    objectType: type,
    [objectTypes[type]]: objectId
  }
  const updateProps = {
    ...filters ? { filters } : {}
  }

  const transaction = await pgdb.transactionBegin()

  let subscription
  try {
    const existingSubscription = await transaction.public.subscriptions.findOne(findProps)

    if (existingSubscription) {
      subscription = await transaction.public.subscriptions.updateAndGetOne(
        { id: existingSubscription.id },
        {
          ...updateProps,
          updatedAt: new Date()
        }
      )
    } else {
      subscription = await transaction.public.subscriptions.insertAndGet({
        ...findProps,
        ...updateProps
      })
    }

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    console.error('rollback!', e)
    throw new Error(t('api/unexpected'))
  }

  return subscription
}

const removeSubscription = async (id, context) => {
  const { pgdb, t } = context

  const subscription = await pgdb.public.subscriptions.deleteAndGetOne({ id })
  if (!subscription) {
    throw new Error(t('api/subscriptions/404'))
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
  removeSubscription,
  getObject,
  getSubject
}
