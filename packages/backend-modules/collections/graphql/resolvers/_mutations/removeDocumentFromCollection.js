const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId, collectionName }, context) => {
  const { user: me, t, req, loaders } = context
  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(
    collectionName,
    me.id,
    context,
  )
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  const { repoId: parsedRepoId } = getParsedDocumentId(documentId)
  const doc = await loaders.Document.byRepoId.load(parsedRepoId)
  // Fall back to the raw input so a row whose document no longer resolves is
  // still deletable.
  const documentRef = doc ? doc.meta.repoId : parsedRepoId

  const item = await Collection.deleteDocumentItem(
    me.id,
    collection.id,
    documentRef,
    context,
  )

  return item
}
