const clearCollection = require('./clearCollection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

module.exports = async (_, args, context) =>
  clearCollection(null, { collectionName: ProgressOptOut.COLLECTION_NAME }, context)
