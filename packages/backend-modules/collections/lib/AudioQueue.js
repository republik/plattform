const Promise = require('bluebird')
const { v4: isUuid } = require('is-uuid')
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')
const { isCollectableType } = require('@orbiting/backend-modules-sanity')
const { refToColumns } = require('./documentRef')

const getCollectionName = () => 'audioqueue'

// Anything typed as `AudioQueueItem` in the schema has to hide Sanity-backed
// rows: that type exposes no `sanityId`, and its `document` resolves to null for
// them — and the web player treats an item without `document.meta.audioSource`
// as corrupt and calls removeAudioQueueItem on it. That applies to
// `User.audioQueue` *and* to every mutation's return value, since they all hand
// back the whole queue. The `userAudioQueue` query serves the full queue as refs.
const publikatorOnly = (items) => items.filter(({ repoId }) => repoId)

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

  // Resolve the client's id to a canonical document ref the same way
  // addDocumentToCollection does, instead of the base64-only decode this used
  // to do: the loader handles publikator repoIds, base64 documentIds and Sanity
  // `_id`s alike, and returns the canonical ref on `meta.repoId` —
  // `sanity:`-prefixed for Sanity-backed content. Never persist the raw input.
  let documentRef
  if (entityId) {
    const { repoId: parsedId } = getParsedDocumentId(entityId)
    if (!parsedId) {
      throw new Error(t('api/collections/audioQueue/error/invalidEntityId'))
    }

    const doc = await loaders.Document.byRepoId.load(parsedId)
    if (!doc) {
      throw new Error(t('api/collections/audioQueue/error/missingDocument'))
    }

    // The publikator branch of that loader filters Elasticsearch to
    // `type: 'Document'`, so a repoId is guaranteed to be an article. The Sanity
    // branch resolves any `_type`, so a queue could otherwise be filled with
    // authors or formats. Keyed on `sanityType` being present, not on the ref
    // being prefixed — see addDocumentToCollection.js.
    if (doc.sanityType && !isCollectableType(doc.sanityType)) {
      throw new Error(t('api/collections/audioQueue/error/missingDocument'))
    }

    documentRef = doc.meta.repoId
  }

  const items = await pgdb.public.collectionDocumentItems.find({
    collectionId: collection.id,
    userId: me.id,
  })

  // The `repoId &&` / `sanityId &&` guards are load-bearing: exactly one column
  // is set per row, so without them a `null === null` comparison would match an
  // unrelated row of the other kind.
  const { repoId, sanityId } = refToColumns(documentRef)
  const existingItem = items.find(
    (item) =>
      item.id === id ||
      (repoId && item.repoId === repoId) ||
      (sanityId && item.sanityId === sanityId),
  )

  if (id && !existingItem) {
    throw new Error(t('api/collections/audioQueue/error/missingItem'))
  }

  const currentSequence = existingItem?.data?.sequence

  // Calculate sequence boundaries
  const maxSequence = items.length > 0
    ? Math.max(...items.map((item) => item.data?.sequence || 0))
    : 0
  const minSequence = items.length > 0
    ? Math.min(...items.map((item) => item.data?.sequence || Infinity))
    : 0

  const nextSequence = maxSequence + 1
  const playNextSequence = minSequence + 1

  // Determine target sequence for the item
  let aimSequence

  if (existingItem && !sequence) {
    // Case 1: Updating existing item without specifying new position
    // → Keep it at its current position
    aimSequence = currentSequence
  } else if (!sequence) {
    // Case 2: Adding new item without specifying position
    // → Insert as "play next" (right after current/first item)
    aimSequence = playNextSequence
  } else if (sequence > nextSequence) {
    // Case 3: (Edge case) Specified position is beyond queue end
    // → Cap it at the end of queue to avoid gaps
    aimSequence = nextSequence
  } else {
    // Case 4: Valid specific position provided
    // → Use it as requested
    aimSequence = sequence
  }

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
      // Spread, not an explicit `repoId`/`sanityId` pair: the unused column has
      // to be *absent* so it inserts NULL, satisfying the
      // "collectionDocumentItems_one_document_ref" check constraint.
      ...refToColumns(documentRef),
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

  // Items the caller didn't mention are appended after the reordered ones,
  // keeping their prior relative order — they are NOT deleted.
  //
  // This used to delete them, which is unsafe for any client that knows only
  // part of the queue. The web player filters items it can't render (see
  // useAudioQueue's `audioSource` filter) and then reorders what's left, so a
  // single drag would silently wipe every Sanity-backed item. Deleting stays
  // the job of removeAudioQueueItem / clearAudioQueue, which is what clients
  // already use.
  //
  // Appending rather than leaving their sequence untouched keeps the column
  // collision-free: nothing enforces uniqueness, and the queue's sort would
  // otherwise fall back on Postgres row order for tied values.
  const appendables = items
    .filter((item) => !updatables.find((update) => update.id === item.id))
    .sort((a, b) => (a.data?.sequence ?? 0) - (b.data?.sequence ?? 0))
    .map((item, index) => ({
      ...item,
      data: {
        ...item.data,
        sequence: updatables.length + index + 1,
      },
    }))

  await Promise.each([...updatables, ...appendables], (item) =>
    pgdb.public.collectionDocumentItems.update(
      { collectionId: collection.id, userId: me.id, id: item.id },
      item,
    ),
  )
}

module.exports = {
  getCollectionName,
  publikatorOnly,

  upsertItem,
  removeItem,
  reorderItems,
}
