const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, { mediaId, ms }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()
  try {
    const collection = await Collection.byNameForUser(
      Progress.COLLECTION_NAME,
      me.id,
      context
    )
    if (!collection) {
      throw new Error(t(`api/collections/collection/404`))
    }

    const item = await Collection.deleteMediaItem(
      me.id,
      collection.id,
      mediaId,
      context
    )

    await transaction.transactionCommit()

    return item
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
