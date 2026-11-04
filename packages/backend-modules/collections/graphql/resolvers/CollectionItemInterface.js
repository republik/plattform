const Collection = require('../../lib/Collection')

module.exports = {
  collection: ({ collectionId, userId }, args, context) =>
    Collection.byIdForUser(collectionId, userId, context),
  // Items never resolve to a GraphQL `Document`: they are Sanity-backed, and
  // reached via the `userCollectionItems` query, which hands out bare ids for
  // the client to resolve against Sanity itself.
  document: () => null,
}
