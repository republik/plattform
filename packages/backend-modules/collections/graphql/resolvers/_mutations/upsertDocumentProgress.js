const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const addDocumentToCollection = require('./addDocumentToCollection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, { documentId, percentage, nodeId }, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req)

  if (!(await Progress.status(me.id, context))) {
    throw new Error(t('api/collections/progress/notEnabled'))
  }
  return addDocumentToCollection(
    null,
    {
      documentId,
      collectionName: Progress.COLLECTION_NAME,
      data: {
        percentage,
        nodeId,
      },
    },
    context,
  )
}
