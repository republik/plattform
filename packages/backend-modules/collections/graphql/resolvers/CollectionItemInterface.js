const Collection = require('../../lib/Collection')

module.exports = {
  collection: ({ collectionId, userId }, args, context) =>
    Collection.byIdForUser(collectionId, userId, context),
  // Only publikator items resolve to a GraphQL `Document`. Sanity-backed ones
  // are reached via the `userCollectionItems` query, which hands out bare ids
  // for the client to resolve against Sanity itself.
  document: ({ repoId }, args, { loaders }) =>
    repoId ? loaders.Document.byRepoId.load(repoId) : null,
}
