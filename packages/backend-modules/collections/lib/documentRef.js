const { isSanityRef, fromSanityRef } = require('@orbiting/backend-modules-sanity')
const { getParsedDocumentId } = require('../../search/lib/Documents')

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

// A *client-supplied* id, by contrast, can't be trusted to say which kind it
// is: it may be a publikator repoId or base64 documentId, a bare Sanity `_id`
// (with or without the `drafts.` prefix), or an already-prefixed ref. Rather
// than resolve the document (an ES or Sanity round trip per id, which defeats
// the point of a batch lookup) we return every column value it could match and
// let the query decide. A wrong-kind candidate simply matches nothing: no row
// holds a repoId in "sanityId" or vice versa.
const inputToColumns = (value) => {
  if (isSanityRef(value)) {
    return { sanityId: fromSanityRef(value) }
  }

  // Tolerant of base64 documentIds and plain repoIds alike; for a Sanity uuid
  // it hands the value straight back.
  const { repoId } = getParsedDocumentId(value)

  return {
    repoId: repoId || undefined,
    sanityId: value.replace(/^drafts\./, ''),
  }
}

module.exports = {
  refToColumns,
  inputToColumns,
}
