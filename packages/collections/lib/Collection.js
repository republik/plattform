const PROGRESS_COLLECTION_NAME = 'progress'

const findForUser = (userId, { pgdb }) =>
  pgdb.public.collections.find({
    hidden: false
  })
    .then(dls => dls
      .map(dl => Object.assign(dl, { userId }))
    )

const byNameForUser = (name, userId, { loaders }) =>
  loaders.Collection.byKeyObj.load({
    name
  })
    .then(dl => dl
      ? Object.assign(dl, { userId })
      : null
    )

const byIdForUser = (id, userId, { loaders }) =>
  loaders.Collection.byKeyObj.load({ id })
    .then(dl => dl
      ? Object.assign(dl, { userId })
      : null
    )

const findDocumentItems = (args, { pgdb }) =>
  pgdb.public.collectionDocumentItems.find(
    args,
    { orderBy: ['createdAt desc'] }
  )

const getDocumentItem = (args, { pgdb }) =>
  pgdb.queryOne(`
    SELECT i.*
    FROM "collectionDocumentItems" i
    WHERE
      i."repoId" = :repoId AND
      i."userId" = :userId AND
      i."collectionId" = (
        SELECT id
        FROM collections
        WHERE name = :collectionName
      )
  `, args)

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
    .then(item => item && ({
      ...item,
      ...item.data
    }))

const upsertMediaItem = async (userId, collectionId, mediaId, data, context) => {
  const query = {
    userId,
    collectionId,
    mediaId
  }
  return upsertItem('collectionMediaItems', query, data, context)
    .then(item => item && ({
      ...item,
      ...item.data
    }))
}

const deleteMediaItem = (userId, collectionId, mediaId, { pgdb }) =>
  pgdb.public.collectionMediaItems.deleteAndGetOne({
    userId,
    collectionId,
    mediaId
  })
    .then(item => item && ({
      ...item,
      ...item.data
    }))

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
    .then(item => item && ({
      ...item,
      ...item.data
    }))

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
