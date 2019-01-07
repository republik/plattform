const DocumentList = require('../../lib/DocumentList')

module.exports = {
  documentList ({ documentListId }, args, context) {
    return DocumentList.byId(documentListId, context)
  }
}
