const Promise = require('bluebird')

const getCollectionName = () => 'playlist'

const upsertPlaylistItem = async (input, context) => {
  const { id, entityId, sequence } = input
  const { user: me, loaders, pgdb } = context

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    throw new Error('Playlist is missing')
  }

  const items = await pgdb.public.collectionDocumentItems.find({
    collectionId: collection.id,
    userId: me.id,
  })

  const existingItem = items.find(
    (item) => item.id === id || item.repoId === entityId,
  )

  const maxSequence =
    (items.length &&
      Math.max(...items.map((item) => item.data?.sequence || 0))) ||
    1

  const isMaxSequenceOccupied = !!items
    .filter((item) => item.id !== existingItem?.id)
    .find((item) => item.data?.sequence === maxSequence)

  const evaluatedMaxSequence =
    (isMaxSequenceOccupied && maxSequence + 1) || maxSequence

  const evaluatedSequence =
    ((!sequence || sequence > maxSequence) && evaluatedMaxSequence) || sequence

  const isSequenceOccupied = !!items
    .filter((item) => item.id !== existingItem?.id)
    .find((item) => item.data?.sequence === evaluatedSequence)

  const updatedItem = {
    collectionId: collection.id,
    userId: me.id,
    repoId: entityId,
    data: {
      ...existingItem?.data,
      sequence: evaluatedSequence,
    },
  }

  if (isSequenceOccupied) {
    await Promise.each(
      items
        .filter((item) => item.id !== existingItem?.id)
        .filter((item) => item.data?.sequence >= evaluatedSequence),
      async (item) => {
        await pgdb.public.collectionDocumentItems.update(
          { id: item.id },
          {
            data: { ...item.data, sequence: item.data?.sequence + 1 },
          },
        )
      },
    )
  }

  if (existingItem) {
    await pgdb.public.collectionDocumentItems.update(
      {
        id: existingItem.id,
      },
      updatedItem,
    )
  } else {
    await pgdb.public.collectionDocumentItems.insert(updatedItem)
  }
}

const removePlaylistItem = async (input, context) => {
  const { id } = input
  const { user: me, loaders, pgdb } = context

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    throw new Error('Playlist is missing')
  }

  await pgdb.public.collectionDocumentItems.delete({
    collectionId: collection.id,
    userId: me.id,
    id,
  })
}

module.exports = {
  getCollectionName,

  upsertPlaylistItem,
  removePlaylistItem,
}
