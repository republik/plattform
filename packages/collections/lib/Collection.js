const {
  COLLECTION_NAME: PROGRESS_COLLECTION_NAME,
  POLICY_NAME: PROGRESS_POLICY_NAME
} = require('./Progress')

const {
  Consents: { registerRevokeHook }
} = require('@orbiting/backend-modules-auth')

registerRevokeHook(({ userId, consent }, context) =>
  consent === PROGRESS_POLICY_NAME &&
    clearItems(userId, PROGRESS_COLLECTION_NAME, context)
)

const assignUserId = (collection, userId) =>
  collection && ({
    ...collection,
    userId
  })

const spreadItemData = item =>
  item && ({
    ...item,
    ...item.data
  })

const findForUser = (userId, { pgdb }) =>
  pgdb.public.collections.find({
    hidden: false
  })
    .then(cs => cs
      .map(c => assignUserId(c, userId))
    )

const byNameForUser = (name, userId, { loaders }) =>
  loaders.Collection.byKeyObj.load({
    name
  })
    .then(c => assignUserId(c, userId))

const byIdForUser = (id, userId, { loaders }) =>
  loaders.Collection.byKeyObj.load({ id })
    .then(c => assignUserId(c, userId))

const findDocumentItems = (args, { pgdb }) =>
  pgdb.public.collectionDocumentItems.find(
    args,
    { orderBy: ['createdAt desc'] }
  )
    .then(items => items
      .map(spreadItemData)
    )

const getItem = async (entityName, { collectionName, ...rest }, { loaders, t }) => {
  if (!loaders[entityName]) {
    console.error(`missing loader ${entityName}`)
    throw new Error(t('api/unexpected'))
  }
  const collection = await loaders.Collection.byKeyObj.load({
    name: collectionName
  })
  return collection && loaders[entityName].byKeyObj.load({
    ...rest,
    collectionId: collection.id
  })
    .then(spreadItemData)
}

const upsertItem = async (tableName, query, data, { pgdb, t }) => {
  if (!pgdb.public[tableName]) {
    console.error(`missing table ${tableName}`)
    throw new Error(t('api/unexpected'))
  }

  const existingItem = await pgdb.public[tableName].findOne(query)
  if (!existingItem) {
    return pgdb.public[tableName].insertAndGet(
      {
        ...query,
        data
      },
      { skipUndefined: true }
    )
      .then(spreadItemData)
  }

  let newData = { ...data }
  let accessor

  if (newData.percentage !== undefined && newData.percentage !== null) {
    accessor = 'percentage'
    newData.percentage = Math.max(newData.percentage, 0)
    newData.percentage = Math.min(newData.percentage, 1)
  } else if (newData.secs !== undefined && newData.secs !== null) {
    accessor = 'secs'
  }

  if (accessor) {
    const existingMax = existingItem.data.max || existingItem
    if (existingMax.data[accessor] > newData[accessor]) {
      newData = {
        ...newData,
        max: existingMax
      }
    }
  }

  return pgdb.public[tableName].updateAndGetOne(
    {
      id: existingItem.id
    },
    {
      ...query,
      data: newData,
      updatedAt: new Date()
    },
    { skipUndefined: true }
  )
    .then(spreadItemData)
}

const getDocumentItem = async (args, context) =>
  getItem('CollectionDocumentItem', args, context)

const upsertDocumentItem = async (userId, collectionId, repoId, data, context) =>
  upsertItem(
    'collectionDocumentItems',
    {
      userId,
      collectionId,
      repoId
    },
    data,
    context
  )

const deleteDocumentItem = (userId, collectionId, repoId, { pgdb }) =>
  pgdb.public.collectionDocumentItems.deleteAndGetOne({
    userId,
    collectionId,
    repoId
  })
    .then(spreadItemData)

const getMediaItem = async (args, context) =>
  getItem('CollectionMediaItem', args, context)

const upsertMediaItem = async (userId, collectionId, mediaId, data, context) =>
  upsertItem(
    'collectionMediaItems',
    {
      userId,
      collectionId,
      mediaId
    },
    data,
    context
  )

const deleteMediaItem = (userId, collectionId, mediaId, { pgdb }) =>
  pgdb.public.collectionMediaItems.deleteAndGetOne({
    userId,
    collectionId,
    mediaId
  })
    .then(spreadItemData)

const getDocumentProgressItem = (args, context) =>
  getDocumentItem(
    {
      ...args,
      collectionName: PROGRESS_COLLECTION_NAME
    },
    context
  )

const getMediaProgressItem = (args, context) =>
  getMediaItem(
    {
      ...args,
      collectionName: PROGRESS_COLLECTION_NAME
    },
    context
  )

const clearItems = async (userId, collectionName, { pgdb, loaders }) => {
  const collection = await loaders.Collection.byKeyObj.load({
    name: collectionName
  })
  return collection && Promise.all([
    pgdb.public.collectionDocumentItems.delete({
      userId,
      collectionId: collection.id
    }),
    pgdb.public.collectionMediaItems.delete({
      userId,
      collectionId: collection.id
    })
  ])
}

const getItemMax = item => spreadItemData(item.data && item.data.max ? item.data.max : item)

module.exports = {
  findForUser,
  byNameForUser,
  byIdForUser,

  findDocumentItems,

  getDocumentItem,
  upsertDocumentItem,
  deleteDocumentItem,

  getMediaItem,
  upsertMediaItem,
  deleteMediaItem,

  getDocumentProgressItem,
  getMediaProgressItem,

  clearItems,

  getItemMax
}
