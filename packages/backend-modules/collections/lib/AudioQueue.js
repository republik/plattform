const Promise = require('bluebird')
const { v4: isUuid } = require('is-uuid')

const getCollectionName = () => 'audioqueue'

const getRepoId = (entityId) => {
  try {
    if (entityId) {
      const [org, repoName] = Buffer.from(entityId, 'base64')
        .toString('utf-8')
        .split('/')
      return [org, repoName].join('/')
    }
  } catch (e) {
    // swallow error
  }

  return undefined
}

// A filter to omit an unwanted item
const omitItem = (unwantedItem) => (item) => item.id !== unwantedItem?.id

// A filter to keep items with a sequence between start and end
const pickSequenceRange = (start, end) => (item) => {
  const { sequence } = item.data
  if (!sequence) {
    return false
  }

  const min = Math.min(start, end)
  const max = Math.max(start, end)

  return sequence >= min && sequence <= max
}

const upsertItem = async (input, context) => {
  const { id, entityType, entityId, sequence } = input
  const { user: me, loaders, pgdb, t } = context

  if (!!id && !isUuid(id)) {
    throw new Error(t('api/collections/audioQueue/error/invalidItemId'))
  }

  if (!!entityId && !entityType) {
    throw new Error(t('api/collections/audioQueue/error/missingEntityType'))
  }

  if (!!entityId && !['Document'].includes(entityType)) {
    throw new Error(t('api/collections/audioQueue/error/unsupportedEntityType'))
  }

  if (sequence && (!Number.isFinite(sequence) || sequence < 1)) {
    throw new Error(t('api/collections/audioQueue/error/unsupportedSequence'))
  }

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    throw new Error(t('api/collections/audioQueue/error/missingCollection'))
  }

  const repoId = getRepoId(entityId)

  if (!!entityId && !repoId) {
    throw new Error(t('api/collections/audioQueue/error/invalidEntityId'))
  }

  if (repoId && !(await loaders.Document.byRepoId.load(repoId))) {
    throw new Error(t('api/collections/audioQueue/error/missingDocument'))
  }

  const items = await pgdb.public.collectionDocumentItems.find({
    collectionId: collection.id,
    userId: me.id,
  })

  const existingItem = items.find(
    (item) => item.id === id || item.repoId === repoId,
  )

  if (id && !existingItem) {
    throw new Error(t('api/collections/audioQueue/error/missingItem'))
  }

  const currentSequence = existingItem?.data?.sequence

  const nextSequence =
    (items.length &&
      Math.max(...items.map((item) => item.data?.sequence || 0))) + 1

  const aimSequence =
    (!sequence && existingItem && nextSequence - 1) ||
    ((!sequence || sequence > nextSequence) && nextSequence) ||
    sequence

  const resequenceItems = items
    .filter(omitItem(existingItem))
    .filter(pickSequenceRange(currentSequence || nextSequence, aimSequence))

  const resequenceModifier = currentSequence < aimSequence ? -1 : 1

  await Promise.each(resequenceItems, async (item) => {
    const { sequence } = item.data
    if (!sequence) {
      return
    }

    await pgdb.public.collectionDocumentItems.update(
      { id: item.id },
      {
        data: {
          ...item.data,
          sequence: sequence + resequenceModifier,
        },
      },
    )
  })

  if (existingItem) {
    await pgdb.public.collectionDocumentItems.update(
      { id: existingItem.id },
      {
        data: {
          ...existingItem.data,
          sequence: aimSequence,
        },
      },
    )
  } else {
    await pgdb.public.collectionDocumentItems.insert({
      collectionId: collection.id,
      userId: me.id,
      repoId,
      data: {
        sequence: aimSequence,
      },
    })
  }
}

const removeItem = async (input, context) => {
  const { id } = input
  const { user: me, loaders, pgdb, t } = context

  if (!!id && !isUuid(id)) {
    throw new Error(t('api/collections/audioQueue/error/invalidItemId'))
  }

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    throw new Error(t('api/collections/audioQueue/error/missingCollection'))
  }

  await pgdb.public.collectionDocumentItems.delete({
    collectionId: collection.id,
    userId: me.id,
    id,
  })
}

const reorderItems = async (input, context) => {
  const { ids } = input
  const { user: me, loaders, pgdb } = context

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  const items = await pgdb.public.collectionDocumentItems.find({
    collectionId: collection.id,
    userId: me.id,
  })

  const updatables = [...new Set(ids)]
    .map((id, index) => {
      const item = items.find((item) => item.id === id)

      if (!item) {
        return false
      }

      return {
        ...item,
        data: {
          ...item.data,
          sequence: index + 1,
        },
      }
    })
    .filter(Boolean)

  const deletable = items.filter(
    (item) => !updatables.find((update) => update.id === item.id),
  )

  await Promise.each(updatables, (item) =>
    pgdb.public.collectionDocumentItems.update(
      { collectionId: collection.id, userId: me.id, id: item.id },
      item,
    ),
  )

  await Promise.each(deletable, ({ id }) =>
    pgdb.public.collectionDocumentItems.delete({
      collectionId: collection.id,
      userId: me.id,
      id,
    }),
  )
}

module.exports = {
  getCollectionName,

  upsertItem,
  removeItem,
  reorderItems,
}
