const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const { resolveInputRef } = require('../../../lib/documentRef')

module.exports = async (_, { documentId, collectionName }, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(
    collectionName,
    me.id,
    context,
  )
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  // No collectable gate on the delete path, and a fall back to the parsed input
  // so a row whose document no longer resolves is still deletable.
  const { parsedRepoId, doc } = await resolveInputRef(documentId, context)

  // An id that parses to nothing — "" and any base64 payload without an
  // "org/repo" in it both land here — can never match a stored row, so 404 is
  // the honest answer. Without this it would reach deleteDocumentItem as an
  // absent ref, which is the difference between "delete this bookmark" and
  // "delete every bookmark".
  if (!parsedRepoId) {
    throw new Error(t(`api/collections/document/404`))
  }

  const documentRef = doc ? doc.meta.repoId : parsedRepoId

  const item = await Collection.deleteDocumentItem(
    me.id,
    collection.id,
    documentRef,
    context,
  )

  return item
}
