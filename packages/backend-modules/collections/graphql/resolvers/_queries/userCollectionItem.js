const byIds = require('./userCollectionItemsByIds')

// "Is this document in the collection?" for content that has no GraphQL
// `Document` to hang `Document.userCollectionItem` off of. Null — not an
// error — when it isn't.
//
// The batch resolver already answers this, and its role gate and positional
// contract are the parts worth having in one place only.
module.exports = async (_, { documentId, collectionName }, context) =>
  byIds(_, { documentIds: [documentId], collectionName }, context).then(
    ([item]) => item,
  )
