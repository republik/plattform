const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')
const ProgressOptOut = require('../../lib/ProgressOptOut')

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
  async userProgress({ meta: { repoId: documentRef } }, _args, context) {
    const { user: me } = context

    if (!documentRef || !me) {
      return
    }

    // Matches the `userDocumentProgress` query's gate, so both progress read
    // paths honour PROGRESS_OPT_OUT. Without this, publikator progress stays
    // readable for an opted-out user while Sanity progress does not.
    if (await ProgressOptOut.status(me.id, context)) {
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
