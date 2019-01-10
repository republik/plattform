const { Roles } = require('@orbiting/backend-modules-auth')
const UserList = require('../../../lib/UserList')

module.exports = async (_, { documentId, listName, data }, context) => {
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
    const doc = await loaders.Document.byRepoId.load(repoId)
    if (!doc) {
      throw new Error(t(`api/document-lists/document/404`))
    }

    await UserList.upsertDocumentItem(
      me.id,
      list.id,
      repoId,
      data,
      pgdb
    )

    await transaction.transactionCommit()

    return doc
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
