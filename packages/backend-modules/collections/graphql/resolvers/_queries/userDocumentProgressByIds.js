const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

// Batch progress lookup for a page's worth of documents: one entry per input
// id, in input order, null where there is no progress. Every early return has
// to keep that alignment, hence the null-filled arrays.
module.exports = async (_, { documentIds }, context) => {
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return documentIds.map(() => null)
  }

  // See userDocumentProgress.js — opting out does not clear stored rows, so the
  // read path has to check the consent too.
  if (await ProgressOptOut.status(me.id, context)) {
    return documentIds.map(() => null)
  }

  const collection = await Collection.byNameForUser(
    ProgressOptOut.COLLECTION_NAME,
    me.id,
    context,
  )
  if (!collection) {
    return documentIds.map(() => null)
  }

  return Collection.findDocumentItemsByInputIds(
    {
      collectionId: collection.id,
      userId: me.id,
      inputIds: documentIds,
    },
    context,
  )
}
