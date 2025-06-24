const moment = require('moment')
const {
  COLLECTION_NAME: PROGRESS_COLLECTION_NAME,
} = require('./ProgressOptOut')

const assignUserId = (collection, userId) =>
  collection && {
    ...collection,
    userId,
  }

const spreadItemData = (item) =>
  item && {
    ...item,
    ...item.data,
  }

const findForUser = (userId, { pgdb }) =>
  pgdb.public.collections
    .find({
      hidden: false,
    })
    .then((cs) => cs.map((c) => assignUserId(c, userId)))

const byNameForUser = (name, userId, { loaders }) =>
  loaders.Collection.byKeyObj
    .load({
      name,
    })
    .then((c) => assignUserId(c, userId))

const byIdForUser = (id, userId, { loaders }) =>
  loaders.Collection.byKeyObj.load({ id }).then((c) => assignUserId(c, userId))

const findDocumentItems = (args, { pgdb }) =>
  pgdb.public.collectionDocumentItems
    .find(args, { orderBy: ['updatedAt desc'] })
    .then((items) => items.map(spreadItemData))

const findDocumentItemsByCollectionNames = (
  { names, progress, userId, lastDays },
  context,
) => {
  const { pgdb } = context

  return pgdb.query(
    `
    SELECT
      document_item.*
    FROM "collectionDocumentItems" document_item
    JOIN collections c ON c.id = document_item."collectionId"
    ${
      progress
        ? `
    LEFT JOIN "collectionDocumentItems" progress_item ON
      progress_item."repoId" = document_item."repoId" AND
      progress_item."userId" = document_item."userId" AND
      progress_item."collectionId" = (SELECT id FROM collections WHERE name = :progressCollectionName)
    `
        : ''
    }
    WHERE
      document_item."userId" = :userId
      AND c.name = ANY(:names)
      ${lastDays ? `AND document_item."updatedAt" >= :afterDate` : ''}
      ${
        progress === 'FINISHED'
          ? `AND ((progress_item.data->>'percentage')::numeric >= 1 OR (((progress_item.data->>'max')::jsonb->>'data')::jsonb->>'percentage')::numeric >= 1)`
          : ''
      }
      ${
        progress === 'UNFINISHED'
          ? `AND (progress_item.data->>'percentage' IS NULL OR ((progress_item.data->>'percentage')::numeric < 1 AND (((progress_item.data->>'max')::jsonb->>'data')::jsonb->>'percentage')::numeric < 1))`
          : ''
      }
    ORDER BY document_item."updatedAt" DESC
  `,
    {
      afterDate: moment().subtract(lastDays, 'days'),
      userId: userId,
      progressCollectionName: PROGRESS_COLLECTION_NAME,
      names,
    },
  )
}

const getItem = async (
  entityName,
  { collectionName, ...rest },
  { loaders, t },
) => {
  if (!loaders[entityName]) {
    console.error(`missing loader ${entityName}`)
    throw new Error(t('api/unexpected'))
  }
  const collection = await loaders.Collection.byKeyObj.load({
    name: collectionName,
  })
  return (
    collection &&
    loaders[entityName].byKeyObj
      .load({
        ...rest,
        collectionId: collection.id,
      })
      .then(spreadItemData)
  )
}

const upsertItem = async (tableName, query, data, { pgdb, t }) => {
  if (!pgdb.public[tableName]) {
    console.error(`missing table ${tableName}`)
    throw new Error(t('api/unexpected'))
  }

  const existingItem = await pgdb.public[tableName].findOne(query)
  if (!existingItem) {
    return pgdb.public[tableName]
      .insertAndGet(
        {
          ...query,
          data,
        },
        { skipUndefined: true },
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
        max: existingMax,
      }
    }
  }

  return pgdb.public[tableName]
    .updateAndGetOne(
      {
        id: existingItem.id,
      },
      {
        ...query,
        data: newData,
        updatedAt: new Date(),
      },
      { skipUndefined: true },
    )
    .then(spreadItemData)
}

const getDocumentItem = async (args, context) =>
  getItem('CollectionDocumentItem', args, context)

const upsertDocumentItem = async (
  userId,
  collectionId,
  repoId,
  data,
  context,
) =>
  upsertItem(
    'collectionDocumentItems',
    {
      userId,
      collectionId,
      repoId,
    },
    data,
    context,
  )

const deleteDocumentItem = (userId, collectionId, repoId, { pgdb }) =>
  pgdb.public.collectionDocumentItems
    .deleteAndGetOne({
      userId,
      collectionId,
      repoId,
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
      mediaId,
    },
    data,
    context,
  )

const deleteMediaItem = (userId, collectionId, mediaId, { pgdb }) =>
  pgdb.public.collectionMediaItems
    .deleteAndGetOne({
      userId,
      collectionId,
      mediaId,
    })
    .then(spreadItemData)

const getDocumentProgressItem = (args, context) =>
  getDocumentItem(
    {
      ...args,
      collectionName: PROGRESS_COLLECTION_NAME,
    },
    context,
  )

const getMediaProgressItem = (args, context) =>
  getMediaItem(
    {
      ...args,
      collectionName: PROGRESS_COLLECTION_NAME,
    },
    context,
  )

const clearItems = async (userId, collectionName, { pgdb, loaders }) => {
  const collection = await loaders.Collection.byKeyObj.load({
    name: collectionName,
  })
  return (
    collection &&
    Promise.all([
      pgdb.public.collectionDocumentItems.delete({
        userId,
        collectionId: collection.id,
      }),
      pgdb.public.collectionMediaItems.delete({
        userId,
        collectionId: collection.id,
      }),
    ])
  )
}

const getItemMax = (item) =>
  spreadItemData(item.data && item.data.max ? item.data.max : item)

module.exports = {
  findForUser,
  byNameForUser,
  byIdForUser,

  findDocumentItems,
  findDocumentItemsByCollectionNames,

  getDocumentItem,
  upsertDocumentItem,
  deleteDocumentItem,

  getMediaItem,
  upsertMediaItem,
  deleteMediaItem,

  getDocumentProgressItem,
  getMediaProgressItem,

  clearItems,

  getItemMax,
}
