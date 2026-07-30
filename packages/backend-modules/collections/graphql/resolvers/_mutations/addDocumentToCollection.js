const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')
const { isCollectableType } = require('@orbiting/backend-modules-sanity')
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
  // The loader's publikator branch filters Elasticsearch to `type: 'Document'`,
  // so a repoId is guaranteed to be an article. Its Sanity branch resolves any
  // `_type`, so without this an author, a format or a settings singleton could
  // be bookmarked or progressed.
  //
  // Keyed on `sanityType` being present rather than on the ref being
  // `sanity:`-prefixed: the loader's legacy-rescue path deliberately keeps
  // `meta.repoId` as the legacy repoId even though it resolved the document out
  // of Sanity, so a prefix check would skip exactly those.
  if (doc.sanityType && !isCollectableType(doc.sanityType)) {
    throw new Error(t(`api/collections/document/404`))
  }
  // `doc.meta.repoId` (not the parsed input) is the canonical ref — for a
  // publikator document these are always equal; for a Sanity-backed one it's
  // the loader's normalized `sanity:`-prefixed ref, which Collection stores in
  // the separate "sanityId" column.
  const documentRef = doc.meta.repoId

  const item = await Collection.upsertDocumentItem(
    me.id,
    collection.id,
    documentRef,
    data,
    context,
  )

  return item
}
