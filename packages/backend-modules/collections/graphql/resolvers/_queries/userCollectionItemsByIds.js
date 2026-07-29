const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

// Batch membership check for a page's worth of documents: one entry per input
// id, in input order, null where the document isn't in the collection. Every
// early return has to keep that alignment, hence the null-filled arrays.
module.exports = async (_, { documentIds, collectionName }, context) => {
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return documentIds.map(() => null)
  }

  const collection = await Collection.byNameForUser(
    collectionName,
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
