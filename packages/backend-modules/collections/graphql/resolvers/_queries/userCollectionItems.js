const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

// Bare document refs, no `Document` resolution: Sanity-backed content has no
// GraphQL `Document` worth building server-side, so clients take the ids from
// here and fetch preview data straight from Sanity. Rows carry "repoId" or
// "sanityId" (never both, see the collectionDocumentItems check constraint),
// which is exactly the CollectionItemRef shape — no field resolvers needed.
module.exports = async (_, { collectionName }, context) => {
  const { user: me } = context
  if (!Roles.userIsInRoles(me, ['member'])) {
    return []
  }

  const collection = await Collection.byNameForUser(
    collectionName,
    me.id,
    context,
  )
  if (!collection) {
    return []
  }

  return Collection.findDocumentItems(
    {
      collectionId: collection.id,
      userId: me.id,
    },
    context,
  )
}
