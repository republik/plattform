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

  // Progress is consent-gated personal data, and opting out does not delete
  // existing rows: the client chains `submitConsent` with `clearProgress`
  // (apps/www ProgressSettings), so a failure between the two leaves rows
  // behind. Reads have to honour the same consent the write path enforces,
  // otherwise those orphans stay readable. The singular `userDocumentProgress`
  // delegates here so this gate exists once.
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
