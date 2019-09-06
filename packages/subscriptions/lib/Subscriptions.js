const { transformUser } = require('@orbiting/backend-modules-auth')

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
    filters: filters && filters.length ? filters : null
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

const getSubscriptionByUserForObject = (
  userId,
  type,
  objectId,
  context
) => {
  const { pgdb } = context
  return pgdb.public.subscriptions.findFirst({
    userId,
    objectType: type,
    [objectTypes[type]]: objectId
  })
}

const getSubscriptionsByUserForObjects = (
  userId,
  type,
  objectIds,
  filter,
  context
) => {
  const { pgdb, t } = context

  const objectColumn = objectTypes[type]
  if (!objectColumn) {
    throw new Error(t('api/unexpected'))
  }

  return pgdb.query(`
    SELECT
      s.*
    FROM
      subscriptions s
    WHERE
      s."userId" = :userId AND
      s."objectType" = :type AND
      ARRAY[s."${objectColumn}"] && :objectIds
      ${filter ? 'AND (s.filters IS NULL OR s.filters ? :filter)' : ''}
  `, {
    userId,
    type,
    objectIds,
    filter
  })
}

const getSubscribersForObject = (
  type,
  objectId,
  filter,
  context
) => {
  const { pgdb, t } = context

  const objectColumn = objectTypes[type]
  if (!objectColumn) {
    throw new Error(t('api/unexpected'))
  }

  return pgdb.query(`
    SELECT
      u.*
    FROM
      subscriptions s
    JOIN
      users u
      ON s."userId" = u.id
    WHERE
      s."objectType" = :type AND
      s."${objectColumn}" = :objectId
      ${filter ? 'AND (s.filters IS NULL OR s.filters ? :filter)' : ''}
  `, {
    type,
    objectId,
    filter
  })
    .then(users => users.map(transformUser))
}

module.exports = {
  upsertSubscription,
  removeSubscription,
  getObject,
  getSubject,
  getSubscriptionByUserForObject,
  getSubscriptionsByUserForObjects,
  getSubscribersForObject
}
