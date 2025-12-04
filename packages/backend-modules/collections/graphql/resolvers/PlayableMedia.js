const { COLLECTION_NAME: PROGRESS_COLLECTION_NAME } = require('../../lib/ProgressOptOut')

module.exports = {
  async userProgress({ mediaId }, args, context) {
    const { user: me, loaders } = context

    if (!mediaId || !me) {
      return
    }

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

    return item ? { ...item, ...item.data } : null
  },
}
