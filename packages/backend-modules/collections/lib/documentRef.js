const { isSanityRef, fromSanityRef } = require('@orbiting/backend-modules-sanity')

// `collectionDocumentItems` stores publikator documents in "repoId" — a FK to
// publikator.repos, so a Sanity `_id` can never go there — and Sanity
// documents in "sanityId". Callers deal in a single opaque *document ref*: the
// Document loader's resolved `meta.repoId`, which is `sanity:`-prefixed for
// Sanity-backed content. This is the only place that knows which column a
// given ref belongs in.
//
// The irrelevant column is omitted rather than set to null, so pgdb builds a
// plain equality predicate either way (and inserts leave the other column
// NULL, satisfying the "collectionDocumentItems_one_document_ref" check).
//
// A falsy ref means "not filtering by document at all" (e.g. listing a whole
// collection), so it must contribute no predicate.
const refToColumns = (ref) => {
  if (!ref) {
    return {}
  }
  return isSanityRef(ref) ? { sanityId: fromSanityRef(ref) } : { repoId: ref }
}

module.exports = {
  refToColumns,
}
