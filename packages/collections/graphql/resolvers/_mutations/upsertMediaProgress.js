const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, { mediaId, secs }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserHasRole(me, 'member')

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

    if (!await Progress.status(me.id, context)) {
      throw new Error(t('api/collections/progress/notEnabled'))
    }

    const item = await Collection.upsertMediaItem(
      me.id,
      collection.id,
      mediaId,
      { secs },
      context
    )

    await transaction.transactionCommit()

    return item
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
