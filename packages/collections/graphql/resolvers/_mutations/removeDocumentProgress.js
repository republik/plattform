const removeDocumentFromCollection = require('./removeDocumentFromCollection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, { documentId }, context) =>
  removeDocumentFromCollection(
    null,
    {
      documentId,
      collectionName: Progress.COLLECTION_NAME
    },
    context
  )
