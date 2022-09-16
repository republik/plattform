const Promise = require('bluebird')

const getCollectionName = () => 'audioqueue'

const getRepoId = (entityId) => {
  if (entityId) {
    const [org, repoName] = Buffer.from(entityId, 'base64')
      .toString('utf-8')
      .split('/')
    return [org, repoName].join('/')
  }

  return undefined
}

const upsertItem = async (input, context) => {
  const { id, entityId, sequence } = input
  const { user: me, loaders, pgdb, t } = context

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    throw new Error('Audio queue is missing')
  }

  const repoId = getRepoId(entityId)

  if (repoId) {
    const doc = await loaders.Document.byRepoId.load(repoId)

    if (!doc) {
      throw new Error(t(`api/collections/document/404`))
    }
  }

  const items = await pgdb.public.collectionDocumentItems.find({
    collectionId: collection.id,
    userId: me.id,
  })

  const existingItem = items.find(
    (item) => item.id === id || item.repoId === repoId,
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
    repoId,
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

const removeItem = async (input, context) => {
  const { id } = input
  const { user: me, loaders, pgdb } = context

  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    throw new Error('Audio queue is missing')
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
    .filter((id) => items.find((item) => item.id === id))
    .map((id, index) => {
      const item = items.find((item) => item.id === id)

      return {
        ...item,
        data: {
          ...item.data,
          sequence: index + 1,
        },
      }
    })

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
