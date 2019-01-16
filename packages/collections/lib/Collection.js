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

const upsertDocumentItem = async (userId, collectionId, repoId, data, { pgdb }) => {
  const query = {
    userId,
    collectionId,
    repoId
  }
  const existingItem =
    await pgdb.public.collectionDocumentItems.findOne(query)
  if (!existingItem) {
    return pgdb.public.collectionDocumentItems.insertAndGet(
      {
        ...query,
        data
      },
      { skipUndefined: true }
    )
  } else {
    return pgdb.public.collectionDocumentItems.updateAndGetOne(
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

module.exports = {
  PROGRESS_COLLECTION_NAME,
  findForUser,
  byNameForUser,
  byIdForUser,
  findDocumentItems,
  getDocumentItem,
  upsertDocumentItem,
  deleteDocumentItem,
  getDocumentProgressItem
}
