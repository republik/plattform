const { COLLECTION_NAME: PROGRESS_COLLECTION_NAME } = require('../../lib/ProgressOptOut')

module.exports = {
  async userProgress({ mediaId }, args, context) {
    const { user: me, loaders } = context

    if (!mediaId || !me) {
      return
    }

    // Use dataloader to batch progress queries instead of individual lookups
    // This eliminates N+1 queries when loading multiple audio items
    const collection = await loaders.Collection.byKeyObj.load({
      name: PROGRESS_COLLECTION_NAME,
    })

    if (!collection) {
      return
    }

    const item = await loaders.CollectionMediaItem.byKeyObj.load({
      mediaId,
      userId: me.id,
      collectionId: collection.id,
    })

    // Spread data field to match expected MediaProgress shape
    return item ? { ...item, ...item.data } : null
  },
}
