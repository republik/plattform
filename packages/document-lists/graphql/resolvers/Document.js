const emptyDocumentConnection = require('@orbiting/backend-modules-documents/lib/emptyDocumentConnection')
const getDocuments = require('@orbiting/backend-modules-documents/graphql/resolvers/_queries/documents')
const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  async userListItems ({ id, userId }, args, context) {
    const { pgdb, user: me } = context
    if (!Roles.userIsInRoles(me, ['member'])) {
      return []
    }
    if (!userId) {
      return emptyDocumentConnection
    }
    const repoIds = await pgdb.queryOneColumn(`
      SELECT
        repoId
      FROM
        "documentListItems"
      WHERE
        "documentListId" = :documentListId AND
        "userId" = :userId
    `, {
      documentListId: id,
      userId
    })
    return getDocuments(
      null,
      {
        repoId: repoIds,
        ...args
      },
      context
    )
  }
}
