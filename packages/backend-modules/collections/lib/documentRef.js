const {
  isSanityRef,
  fromSanityRef,
  repoIdToSanityId,
} = require('@orbiting/backend-modules-sanity')
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')

// `repoIdToSanityId` throws when the input isn't an "owner/repo"-shaped github
// path, which for an untrusted id just means "not a legacy repoId" — same
// tolerance as fetchDocumentByLegacyRepoId.
const derivedSanityId = (repoId) => {
  try {
    return repoIdToSanityId(repoId)
  } catch {
    return undefined
  }
}

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

  // The "sanityId" candidate has to cover two unrelated cases, and they are
  // mutually exclusive because a uuid is not an "owner/repo" path and vice
  // versa:
  //
  //  - `value` is a legacy repoId (or a base64 documentId wrapping one) whose
  //    content has moved to Sanity. Its Sanity `_id` was minted from the repoId
  //    by the one-time import, so we can *compute* it — no round trip. Without
  //    this, a client still holding a legacy repoId stops finding its own row
  //    the moment migrate-legacy-references.ts rewrites that row to "sanityId",
  //    i.e. the bookmark or progress silently disappears.
  //  - `value` is already a bare Sanity `_id`, in which case it is the candidate.
  const sanityId =
    (repoId && derivedSanityId(repoId)) || value.replace(/^drafts\./, '')

  return {
    repoId: repoId || undefined,
    sanityId,
  }
}

module.exports = {
  refToColumns,
  inputToColumns,
}
