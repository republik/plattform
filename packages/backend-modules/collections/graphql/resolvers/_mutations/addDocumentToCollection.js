const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const { resolveInputRef } = require('../../../lib/documentRef')

module.exports = async (_, { documentId, collectionName, data }, context) => {
  const { req, user: me, t } = context
  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(
    collectionName,
    me.id,
    context,
  )
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  // Unresolvable and not-collectable are both a 404 here: nothing but an
  // article may be bookmarked or progressed. See lib/documentRef.js.
  const { ref: documentRef } = await resolveInputRef(documentId, context)
  if (!documentRef) {
    throw new Error(t(`api/collections/document/404`))
  }

  const item = await Collection.upsertDocumentItem(
    me.id,
    collection.id,
    documentRef,
    data,
    context,
  )

  return item
}
