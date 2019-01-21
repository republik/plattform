const {
  COLLECTION_NAME: PROGRESS_COLLECTION_NAME
} = require('./Progress')

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

const getItem = async (entityName, { collectionName, ...rest }, { loaders }) => {
  const collection = await loaders.Collection.byKeyObj.load({
    name: collectionName
  })
  return collection && loaders[entityName].byKeyObj.load({
    ...rest,
    collectionId: collection.id
  })
    .then(spreadItemData)
}

const upsertItem = async (tableName, query, data, { pgdb }) => {
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
  } else {
    return pgdb.public[tableName].updateAndGetOne(
      {
        id: existingItem.id
      },
      {
        ...query,
        data,
        updatedAt: new Date()
      },
      { skipUndefined: true }
    )
      .then(spreadItemData)
  }
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

const clearItems = (userId, collectionId, { pgdb }) =>
  Promise.all([
    pgdb.public.collectionDocumentItems.delete({
      userId,
      collectionId
    }),
    pgdb.public.collectionMediaItems.delete({
      userId,
      collectionId
    })
  ])

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

  clearItems
}
