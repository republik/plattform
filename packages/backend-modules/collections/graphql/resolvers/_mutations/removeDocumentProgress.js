const removeDocumentFromCollection = require('./removeDocumentFromCollection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

module.exports = async (_, { documentId }, context) =>
  removeDocumentFromCollection(
    null,
    {
      documentId,
      collectionName: ProgressOptOut.COLLECTION_NAME,
    },
    context,
  )
