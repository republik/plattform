const DocumentList = require('../../../lib/DocumentList')

module.exports = (_, args, { pgdb }) =>
  DocumentList.find(pgdb)
