const byIds = require('./userDocumentProgressByIds')

// "How far did I get in this document?" for content that has no GraphQL
// `Document` to hang `Document.userProgress` off of. Null — not an error —
// when there is no progress.
//
// Delegates so the role check and the progress consent gate — which reads have
// to honour, not just writes — live in exactly one place.
module.exports = async (_, { documentId }, context) =>
  byIds(_, { documentIds: [documentId] }, context).then(([item]) => item)
