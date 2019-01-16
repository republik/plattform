const removeDocumentFromCollection = require('./removeDocumentFromCollection')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId }, context) =>
  removeDocumentFromCollection(
    null,
    {
      documentId,
      collectionName: Collection.PROGRESS_COLLECTION_NAME
    },
    context
  )
