const PROGRESS_COLLECTION_NAME = 'progress'

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

const getDocumentItem = async ({ collectionName, ...rest }, { loaders }) => {
  const collection = await loaders.Collection.byKeyObj.load({
    name: collectionName
  })
  return loaders.CollectionDocumentItem.byKeyObj.load({
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

const upsertDocumentItem = async (userId, collectionId, repoId, data, context) => {
  const query = {
    userId,
    collectionId,
    repoId
  }
  return upsertItem('collectionDocumentItems', query, data, context)
}

const deleteDocumentItem = (userId, collectionId, repoId, { pgdb }) =>
  pgdb.public.collectionDocumentItems.deleteAndGetOne({
    userId,
    collectionId,
    repoId
  })

const getDocumentProgressItem = (args, context) =>
  getDocumentItem(
    {
      ...args,
      collectionName: PROGRESS_COLLECTION_NAME
    },
    context
  )

const upsertMediaItem = async (userId, collectionId, mediaId, data, context) => {
  const query = {
    userId,
    collectionId,
    mediaId
  }
  return upsertItem('collectionMediaItems', query, data, context)
}

const deleteMediaItem = (userId, collectionId, mediaId, { pgdb }) =>
  pgdb.public.collectionMediaItems.deleteAndGetOne({
    userId,
    collectionId,
    mediaId
  })
    .then(spreadItemData)

const getMediaProgressItem = (args, { pgdb }) =>
  pgdb.queryOne(`
    SELECT i.*
    FROM "collectionMediaItems" i
    WHERE
      i."mediaId" = :mediaId AND
      i."userId" = :userId AND
      i."collectionId" = (
        SELECT id
        FROM collections
        WHERE name = :collectionName
      )
  `, {
    ...args,
    collectionName: PROGRESS_COLLECTION_NAME

  })
    .then(spreadItemData)

module.exports = {
  PROGRESS_COLLECTION_NAME,
  findForUser,
  byNameForUser,
  byIdForUser,

  findDocumentItems,
  getDocumentItem,

  upsertDocumentItem,
  deleteDocumentItem,
  getDocumentProgressItem,

  upsertMediaItem,
  deleteMediaItem,
  getMediaProgressItem
}
