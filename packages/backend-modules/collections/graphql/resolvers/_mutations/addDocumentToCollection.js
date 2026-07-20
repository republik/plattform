const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { getParsedDocumentId } = require('../../../../search/lib/Documents')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId, collectionName, data }, context) => {
  const { req, user: me, t, loaders } = context
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
  if (!doc) {
    throw new Error(t(`api/collections/document/404`))
  }
  // `doc.meta.repoId` (not the parsed input) is the canonical storage key —
  // for a publikator document these are always equal; for a Sanity-backed
  // one it's the loader's normalized `sanity:`-prefixed ref.
  const repoId = doc.meta.repoId

  const item = await Collection.upsertDocumentItem(
    me.id,
    collection.id,
    repoId,
    data,
    context,
  )

  return item
}
