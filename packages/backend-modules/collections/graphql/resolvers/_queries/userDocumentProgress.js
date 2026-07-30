const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

// "How far did I get in this document?" for content that has no GraphQL
// `Document` to hang `Document.userProgress` off of. Null — not an error —
// when there is no progress.
module.exports = async (_, { documentId }, context) => {
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return null
  }

  // Progress is consent-gated personal data, and opting out does not delete
  // existing rows: the client chains `submitConsent` with `clearProgress`
  // (apps/www ProgressSettings), so a failure between the two leaves rows
  // behind. Reads have to honour the same consent the write path enforces,
  // otherwise those orphans stay readable.
  if (await ProgressOptOut.status(me.id, context)) {
    return null
  }

  const collection = await Collection.byNameForUser(
    ProgressOptOut.COLLECTION_NAME,
    me.id,
    context,
  )
  if (!collection) {
    return null
  }

  const [item] = await Collection.findDocumentItemsByInputIds(
    {
      collectionId: collection.id,
      userId: me.id,
      inputIds: [documentId],
    },
    context,
  )

  return item
}
