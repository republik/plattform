const { v4: isUuid } = require('is-uuid')
const {
  refToColumns,
  matchesColumns,
  resolveInputRef,
} = require('./documentRef')
const ProgressOptOut = require('./ProgressOptOut')

const getCollectionName = () => 'audioqueue'

// Anything typed as `AudioQueueItem` in the schema has to hide Sanity-backed
// rows: that type exposes no `sanityId`, and its `document` resolves to null for
// them — and the web player treats an item without `document.meta.audioSource`
// as corrupt and calls removeAudioQueueItem on it. That applies to
// `User.audioQueue` *and* to every mutation's return value, since they all hand
// back the whole queue. The `userAudioQueue` query serves the full queue as refs.
const publikatorOnly = (items) => items.filter(({ repoId }) => repoId)

// The whole queue as `AudioQueueItemRef` rows, Sanity-backed items included.
//
// Every resolver returning that type must go through this, not the loader
// directly: `AudioQueueItemRef.userProgress` reads `progressOptOut` off the row
// (the consent lookup is a plain query, so it can't live in a per-item field
// resolver without costing one query per item), and a row *missing* the flag
// reads as "not opted out" — which would serve progress to someone who opted
// out. Attaching it here makes that unforgettable.
//
// Copied onto new objects rather than mutated, so the dataloader's cached rows
// stay clean.
const toRefs = async (userId, context) => {
  // Every caller is a mutation returning the queue it just changed, and
  // createDataLoader leaves DataLoader's per-request cache on — so drop the key
  // first. Without it, anything that happened to read the queue earlier in the
  // same request would make this reply the pre-mutation state.
  context.loaders.AudioQueue.byUserId.clear(userId)

  const [items, progressOptOut] = await Promise.all([
    context.loaders.AudioQueue.byUserId.load(userId),
    ProgressOptOut.status(userId, context),
  ])

  return items.map((item) => ({ ...item, progressOptOut }))
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

  // Resolve the client's id to a canonical document ref, instead of the
  // base64-only decode this used to do — never persist the raw input. See
  // lib/documentRef.js; a queue would otherwise accept authors or formats.
  let documentRef
  if (entityId) {
    const { parsedRepoId, ref } = await resolveInputRef(entityId, context)
    if (!parsedRepoId) {
      throw new Error(t('api/collections/audioQueue/error/invalidEntityId'))
    }
    if (!ref) {
      throw new Error(t('api/collections/audioQueue/error/missingDocument'))
    }

    documentRef = ref
  }

  const items = await pgdb.public.collectionDocumentItems.find({
    collectionId: collection.id,
    userId: me.id,
  })

  const columns = refToColumns(documentRef)
  const existingItem = items.find(
    (item) => item.id === id || matchesColumns(item, columns),
  )

  if (id && !existingItem) {
    throw new Error(t('api/collections/audioQueue/error/missingItem'))
  }

  const currentSequence = existingItem?.data?.sequence

  // Calculate sequence boundaries
  const maxSequence =
    items.length > 0
      ? Math.max(...items.map((item) => item.data?.sequence || 0))
      : 0
  const minSequence =
    items.length > 0
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

  // Disjoint rows (`existingItem` is filtered out above), so the updates don't
  // have to wait on each other.
  await Promise.all(
    resequenceItems
      .filter((item) => item.data.sequence)
      .map((item) =>
        pgdb.public.collectionDocumentItems.update(
          { id: item.id },
          {
            data: {
              ...item.data,
              sequence: item.data.sequence + resequenceModifier,
            },
          },
        ),
      ),
  )

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

  const reordered = [...new Set(ids)]
    .map((id) => items.find((item) => item.id === id))
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
  const appended = items
    .filter((item) => !reordered.includes(item))
    .sort((a, b) => (a.data?.sequence ?? 0) - (b.data?.sequence ?? 0))

  // Only rows whose sequence actually moves are written — a client submitting
  // the whole queue leaves the appended tail exactly where it already was — and
  // only `data` is written, the rest of the row is unchanged by a reorder.
  await Promise.all(
    [...reordered, ...appended].map((item, index) => {
      const sequence = index + 1
      if (item.data?.sequence === sequence) {
        return null
      }

      return pgdb.public.collectionDocumentItems.update(
        { collectionId: collection.id, userId: me.id, id: item.id },
        { data: { ...item.data, sequence } },
      )
    }),
  )
}

module.exports = {
  getCollectionName,
  publikatorOnly,
  toRefs,

  upsertItem,
  removeItem,
  reorderItems,
}
