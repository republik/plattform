const objectTypeToColumn = ({
  'User': 'objectUserId',
  'Document': 'objectDocumentId',
  'Discussion': 'objectDiscussionId'
})

const columnToObjectType = Object.keys(objectTypeToColumn)
  .reduce(
    (agg, key) => {
      agg[objectTypeToColumn[key]] = key
      return agg
    },
    {}
  )

const getTypeOfRow = (dbObj) => {
  return Object.keys(columnToObjectType)
    .reduce((agg, columnKey) => {
      if (agg) {
        return agg
      }
      if (dbObj[columnKey] !== null) {
        return columnToObjectType[columnKey]
      }
    }, null)
}

const subscribe = async (args, context) => {
  const { t, pgdb } = context
  const { userId, objectId, type, filters } = args

  if (type !== 'User') {
    throw new Error(t('api/subscriptions/type/notSupported'))
  }

  const subscription = await pgdb.public.subscriptions.insertAndGet({
    userId,
    filters,
    [objectTypeToColumn[type]]: objectId
  })

  return subscription
}

const getObject = async (subscription, context) => {
  const type = getTypeOfRow(subscription)
  const { loaders, t } = context

  if (type !== 'User') {
    throw new Error(t('api/subscriptions/type/notSupported'))
  }

  // TODO cleanup with type resolver
  const obj = await loaders.User.byId.load(
    subscription[objectTypeToColumn[type]]
  )
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
  objectTypeToColumn,
  columnToObjectType,
  subscribe,
  getObject,
  getSubject
}
