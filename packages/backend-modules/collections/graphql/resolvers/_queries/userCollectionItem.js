const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

// "Is this document in the collection?" for content that has no GraphQL
// `Document` to hang `Document.userCollectionItem` off of. Null — not an
// error — when it isn't.
module.exports = async (_, { documentId, collectionName }, context) => {
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return null
  }

  const collection = await Collection.byNameForUser(
    collectionName,
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
