const { Roles } = require('@orbiting/backend-modules-auth')
const { getParsedDocumentId } = require('../../../../search/lib/Documents')
const Collection = require('../../../lib/Collection')

// Root-level equivalent of Document.userCollectionItem — needed because
// Sanity-backed content has no GraphQL Document type to hang a type-field
// off of yet, only a repoId/Sanity-ref resolvable via the Document loader.
module.exports = async (_, { documentId, collectionName }, context) => {
  const { user: me, loaders } = context
  if (!Roles.userIsInRoles(me, ['member'])) {
    return null
  }

  const { repoId: parsedRepoId } = getParsedDocumentId(documentId)
  const doc = await loaders.Document.byRepoId.load(parsedRepoId)
  if (!doc) {
    return null
  }

  return Collection.getDocumentItem(
    {
      repoId: doc.meta.repoId,
      userId: me.id,
      collectionName,
    },
    context,
  )
}
