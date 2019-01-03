const { Roles } = require('@orbiting/backend-modules-auth')
const DocumentList = require('../../../lib/DocumentList')

module.exports = async (_, { documentId, listId }, context) => {
  const { pgdb, user: me, t, loaders } = context
  Roles.ensureUserHasRole(me, 'member')

  const transaction = await pgdb.transactionBegin()
  try {
    const list = await DocumentList.findOne(pgdb, {
      id: listId
    })
    if (!list) {
      throw new Error(t(`api/document-lists/list/404`))
    }

    const doc = await loaders.Document.byRepoId.load(documentId)
    if (!doc) {
      throw new Error(t(`api/document-lists/document/404`))
    }

    await DocumentList.insert(
      me.id,
      list.id,
      documentId,
      pgdb
    )

    await transaction.transactionCommit()

    return list
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
