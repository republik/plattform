const { Roles } = require('@orbiting/backend-modules-auth')
const { paginate } = require('@orbiting/backend-modules-utils')
const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')
const { inputToColumns, matchesColumns } = require('../../../lib/documentRef')

// The Sanity-capable counterpart of `User.collectionItems`, which backs the
// Leseliste. That field hard-filters to publikator rows because its `document`
// field must resolve, so as content moves to Sanity it silently returns fewer
// rows. This one hands out bare refs instead and keeps everything.
//
// Rows carry "repoId" or "sanityId" (never both, see the
// collectionDocumentItems check constraint), which is exactly the
// CollectionItemRef shape — no field resolvers needed.

// Rows for the same article can be keyed either way while content migrates, so
// identity is "the document this row points at", not the column it used.
const documentKey = ({ repoId, sanityId }) => sanityId || repoId

module.exports = async (_, args, context) => {
  const { names, progress, excludeDocumentId, uniqueDocuments } = args
  const { user: me } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return paginate(args, [])
  }

  // `names` may include the hidden `progress` collection, and `progress:` reads
  // it regardless — both are consent-gated personal data. See
  // userDocumentProgress.js for why the read path has to check and not just the
  // write path.
  const touchesProgress =
    !!progress || names.includes(ProgressOptOut.COLLECTION_NAME)
  if (touchesProgress && (await ProgressOptOut.status(me.id, context))) {
    return paginate(args, [])
  }

  let items = await Collection.findDocumentItemsByCollectionNames(
    {
      ...args,
      userId: me.id,
      includeSanity: true,
    },
    context,
  )

  if (uniqueDocuments) {
    items = items.filter(
      (a, index, all) =>
        index === all.findIndex((b) => documentKey(b) === documentKey(a)),
    )
  }

  if (excludeDocumentId) {
    // A client-supplied id can't say which column it belongs to, so compare
    // against both candidates — a wrong-kind candidate simply matches nothing.
    const columns = inputToColumns(excludeDocumentId)
    items = items.filter((item) => !matchesColumns(item, columns))
  }

  return paginate(args, items)
}
