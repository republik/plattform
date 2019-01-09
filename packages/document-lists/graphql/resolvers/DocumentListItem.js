const DocumentList = require('../../lib/DocumentList')

module.exports = {
  documentList ({ documentListId, userId }, args, context) {
    return DocumentList.byIdForUser(documentListId, userId, context)
  }
}
