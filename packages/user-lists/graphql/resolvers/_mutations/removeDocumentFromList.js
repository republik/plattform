const { Roles } = require('@orbiting/backend-modules-auth')
const UserList = require('../../../lib/UserList')

module.exports = async (_, { documentId, listName }, context) => {
  const { pgdb, user: me, t, loaders } = context
  Roles.ensureUserHasRole(me, 'member')

  const transaction = await pgdb.transactionBegin()
  try {
    const list = await UserList.byNameForUser(listName, me.id, context)
    if (!list) {
      throw new Error(t(`api/document-lists/list/404`))
    }

    const repoId = Buffer.from(documentId, 'base64')
      .toString('utf-8')
      .split('/')
      .slice(0, 2)
      .join('/')
    await UserList.deleteDocumentItem(
      me.id,
      list.id,
      repoId,
      pgdb
    )

    await transaction.transactionCommit()

    return loaders.Document.byRepoId.load(repoId)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
