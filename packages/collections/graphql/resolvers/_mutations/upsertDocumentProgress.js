const addDocumentToCollection = require('./addDocumentToCollection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, { documentId, percentage, nodeId }, context) =>
  addDocumentToCollection(
    null,
    {
      documentId,
      collectionName: Progress.COLLECTION_NAME,
      data: {
        percentage,
        nodeId
      }
    },
    context
  )
