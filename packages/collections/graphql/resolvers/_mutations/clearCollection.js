const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { collectionName }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req)

  const transaction = await pgdb.transactionBegin()
  try {
    const collection = await Collection.byNameForUser(collectionName, me.id, context)
    if (!collection) {
      throw new Error(t(`api/collections/collection/404`))
    }

    await Collection.clearItems(
      me.id,
      collection.id,
      context
    )

    await transaction.transactionCommit()

    return collection
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
