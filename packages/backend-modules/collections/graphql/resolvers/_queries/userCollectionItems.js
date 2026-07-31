const { Roles } = require('@orbiting/backend-modules-auth')
const { paginate } = require('@orbiting/backend-modules-utils')
const Collection = require('../../../lib/Collection')

// Bare document refs, no `Document` resolution: Sanity-backed content has no
// GraphQL `Document` worth building server-side, so clients take the ids from
// here and fetch preview data straight from Sanity. Rows carry "repoId" or
// "sanityId" (never both, see the collectionDocumentItems check constraint),
// which is exactly the CollectionItemRef shape — no field resolvers needed.
module.exports = async (_, args, context) => {
  const { collectionName } = args
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return paginate(args, [])
  }

  const collection = await Collection.byNameForUser(
    collectionName,
    me.id,
    context,
  )
  if (!collection) {
    return paginate(args, [])
  }

  const items = await Collection.findDocumentItems(
    {
      collectionId: collection.id,
      userId: me.id,
    },
    context,
  )

  return paginate(args, items)
}
