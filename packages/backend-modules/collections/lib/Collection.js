const moment = require('moment')
const {
  COLLECTION_NAME: PROGRESS_COLLECTION_NAME,
} = require('./ProgressOptOut')
const { refToColumns, inputToColumns } = require('./documentRef')

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

const findDocumentItems = ({ documentRef, ...args }, { pgdb }) =>
  pgdb.public.collectionDocumentItems
    .find(
      {
        ...args,
        ...refToColumns(documentRef),
      },
      { orderBy: ['updatedAt desc'] },
    )
    .then((items) => items.map(spreadItemData))

// Looks up items for client-supplied document ids, without resolving the
// documents themselves. Returns one entry per input id, in input order, null
// where the document isn't in the collection — positional alignment is the
// contract callers rely on, so duplicates and misses both keep their slot.
const findDocumentItemsByInputIds = async (
  { collectionId, userId, inputIds },
  { pgdb },
) => {
  const columns = inputIds.map(inputToColumns)
  const repoIds = [...new Set(columns.map((c) => c.repoId).filter(Boolean))]
  const sanityIds = [...new Set(columns.map((c) => c.sanityId).filter(Boolean))]

  // One branch per column, both scoped to the collection and user. Nesting the
  // scope inside each branch (rather than pairing a top-level `or` with sibling
  // keys) keeps the AND/OR precedence unambiguous.
  const branches = []
  if (repoIds.length) {
    branches.push({ collectionId, userId, repoId: repoIds })
  }
  if (sanityIds.length) {
    branches.push({ collectionId, userId, sanityId: sanityIds })
  }
  if (!branches.length) {
    return inputIds.map(() => null)
  }

  const rows = await pgdb.public.collectionDocumentItems.find({
    or: branches.map((and) => ({ and })),
  })

  return columns.map(({ repoId, sanityId }) => {
    const row = rows.find(
      (r) =>
        (repoId && r.repoId === repoId) || (sanityId && r.sanityId === sanityId),
    )
    return row ? spreadItemData(row) : null
  })
}

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
      -- IS NOT DISTINCT FROM, not =: exactly one of the two columns is set on
      -- any given row, so the unused one is NULL on both sides.
      progress_item."repoId" IS NOT DISTINCT FROM document_item."repoId" AND
      progress_item."sanityId" IS NOT DISTINCT FROM document_item."sanityId" AND
      progress_item."userId" = document_item."userId" AND
      progress_item."collectionId" = (SELECT id FROM collections WHERE name = :progressCollectionName)
    `
        : ''
    }
    WHERE
      document_item."userId" = :userId
      AND c.name = ANY(:names)
      -- publikator items only: this feeds \`User.collectionItems\`, whose
      -- \`document\` field needs a resolvable GraphQL Document. Sanity-backed
      -- items are served by the \`userCollectionItems\` query instead.
      AND document_item."repoId" IS NOT NULL
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

const getDocumentItem = async ({ documentRef, ...args }, context) =>
  getItem(
    'CollectionDocumentItem',
    {
      ...args,
      ...refToColumns(documentRef),
    },
    context,
  )

const upsertDocumentItem = async (
  userId,
  collectionId,
  documentRef,
  data,
  context,
) =>
  upsertItem(
    'collectionDocumentItems',
    {
      userId,
      collectionId,
      ...refToColumns(documentRef),
    },
    data,
    context,
  )

const deleteDocumentItem = (userId, collectionId, documentRef, { pgdb }) =>
  pgdb.public.collectionDocumentItems
    .deleteAndGetOne({
      userId,
      collectionId,
      ...refToColumns(documentRef),
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
  findDocumentItemsByInputIds,
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
