const emptyDocumentConnection = require('../../../lib/emptyDocumentConnection')

// Legacy (publikator) documents were served from Elasticsearch, which is gone:
// no GraphQL `Document` can be produced anymore. Kept as the one place
// `document`, `documents`, `Document.linkedDocuments` and `DocumentZone.document`
// resolve through, so they answer "nothing found" instead of failing. Content
// lives in Sanity, which clients read directly.
module.exports = async () => emptyDocumentConnection
