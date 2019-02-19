const Collection = require('../../lib/Collection')

module.exports = {
  collection: ({ collectionId, userId }, args, context) =>
    Collection.byIdForUser(collectionId, userId, context),
  document: ({ repoId }, args, { loaders }) =>
    loaders.Document.byRepoId.load(repoId)
}
