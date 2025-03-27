const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const addDocumentToCollection = require('./addDocumentToCollection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

module.exports = async (_, { documentId, percentage, nodeId }, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req)

  if ((await ProgressOptOut.status(me.id, context))) {
    throw new Error(t('api/collections/progress/notEnabled'))
  }
  return addDocumentToCollection(
    null,
    {
      documentId,
      collectionName: ProgressOptOut.COLLECTION_NAME,
      data: {
        percentage,
        nodeId,
      },
    },
    context,
  )
}
