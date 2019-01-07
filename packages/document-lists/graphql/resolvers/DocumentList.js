const emptyDocumentConnection = require('@orbiting/backend-modules-documents/lib/emptyDocumentConnection')
const getDocuments = require('@orbiting/backend-modules-documents/graphql/resolvers/_queries/documents')
const DocumentList = require('../../lib/DocumentList')

module.exports = {
  id ({ id: documentListId, userId }) {
    return `${documentListId}${userId ? '_' + userId : ''}`
  },
  async userDocuments ({ id: documentListId, userId }, args, context) {
    if (!userId) {
      return emptyDocumentConnection
    }
    const repoIds = await DocumentList.findItems({
      documentListId,
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
