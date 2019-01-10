const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId, collectionName }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserHasRole(me, 'member')

  const transaction = await pgdb.transactionBegin()
  try {
    const collection = await Collection.byNameForUser(collectionName, me.id, context)
    if (!collection) {
      throw new Error(t(`api/collections/collection/404`))
    }

    const repoId = Buffer.from(documentId, 'base64')
      .toString('utf-8')
      .split('/')
      .slice(0, 2)
      .join('/')
    const item = await Collection.deleteDocumentItem(
      me.id,
      collection.id,
      repoId,
      context
    )

    await transaction.transactionCommit()

    console.log({ item })
    return item
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
