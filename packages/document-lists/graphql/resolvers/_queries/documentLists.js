const DocumentList = require('../../../lib/DocumentList')

module.exports = (_, args, context) =>
  DocumentList.find(null, context)
