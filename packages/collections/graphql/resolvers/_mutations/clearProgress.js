const clearCollection = require('./clearCollection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, args, context) =>
  clearCollection(
    null,
    { collectionName: Progress.COLLECTION_NAME },
    context
  )
