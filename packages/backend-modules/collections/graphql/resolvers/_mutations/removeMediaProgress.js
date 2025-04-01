const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

module.exports = async (_, { mediaId }, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(
    ProgressOptOut.COLLECTION_NAME,
    me.id,
    context,
  )
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  const item = await Collection.deleteMediaItem(
    me.id,
    collection.id,
    mediaId,
    context,
  )

  return item
}
