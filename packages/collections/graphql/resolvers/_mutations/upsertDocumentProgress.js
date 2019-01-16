const addDocumentToCollection = require('./addDocumentToCollection')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId, percentage, nodeId }, context) =>
  addDocumentToCollection(
    null,
    {
      documentId,
      collectionName: Collection.PROGRESS_COLLECTION_NAME,
      data: {
        percentage,
        nodeId
      }
    },
    context
  )
