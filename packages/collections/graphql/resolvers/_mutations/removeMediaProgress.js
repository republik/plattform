const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { mediaId, ms }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserHasRole(me, 'member')

  const transaction = await pgdb.transactionBegin()
  try {
    const collection = await Collection.byNameForUser(
      Collection.PROGRESS_COLLECTION_NAME,
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
