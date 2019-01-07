const { Roles } = require('@orbiting/backend-modules-auth')
const DocumentList = require('../../../lib/DocumentList')

module.exports = async (_, { documentId, listName }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserHasRole(me, 'member')

  const transaction = await pgdb.transactionBegin()
  try {
    const list = await DocumentList.byNameForUser(listName, me.id, context)
    if (!list) {
      throw new Error(t(`api/document-lists/list/404`))
    }

    const repoId = Buffer.from(documentId, 'base64')
      .toString('utf-8')
      .split('/')
      .slice(0, 2)
      .join('/')
    await DocumentList.del(
      me.id,
      list.id,
      repoId,
      pgdb
    )

    await transaction.transactionCommit()

    return list
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
