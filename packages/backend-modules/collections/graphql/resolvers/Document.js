const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')

// `meta.repoId` is the Document loader's *resolved* ref — a plain publikator
// repoId, or a `sanity:`-prefixed one for Sanity-backed content. Which column
// that lands in is lib/documentRef.js's business, not ours.
module.exports = {
  async userCollectionItems({ meta: { repoId: documentRef } }, args, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !documentRef) {
      return []
    }
    return Collection.findDocumentItems(
      {
        documentRef,
        userId: me.id,
      },
      context,
    )
  },
  async userCollectionItem(
    { meta: { repoId: documentRef } },
    { collectionName },
    context,
  ) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !documentRef) {
      return
    }
    return Collection.getDocumentItem(
      {
        documentRef,
        userId: me.id,
        collectionName,
      },
      context,
    )
  },
  userProgress({ meta: { repoId: documentRef } }, _args, context) {
    const { user: me } = context

    if (!documentRef || !me) {
      return
    }

    return Collection.getDocumentProgressItem(
      {
        documentRef,
        userId: me.id,
      },
      context,
    )
  },
}
