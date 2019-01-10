const emptyDocumentConnection = require('@orbiting/backend-modules-documents/lib/emptyDocumentConnection')
const getDocuments = require('@orbiting/backend-modules-documents/graphql/resolvers/_queries/documents')
const UserList = require('../../lib/UserList')

module.exports = {
  id ({ id: userListId, userId }) {
    return `${userListId}${userId ? '_' + userId : ''}`
  },
  async documents ({ id: userListId, userId }, args, context) {
    if (!userId) {
      return emptyDocumentConnection
    }
    const repoIds = await UserList.findDocumentItems({
      userListId,
      userId
    }, context)
      .then(items => items
        .map(i => i.repoId)
      )
    if (!repoIds.length) {
      return emptyDocumentConnection
    }
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
