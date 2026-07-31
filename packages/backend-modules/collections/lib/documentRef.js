const {
  isSanityRef,
  fromSanityRef,
  publishedId,
  legacySanityId,
  isCollectableType,
} = require('@orbiting/backend-modules-sanity')
const {
  getParsedDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')

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
// Throws on a falsy ref, and that is the whole point: these columns identify
// *one* document, and an operation scoped to a single item that silently
// contributes no predicate is scoped to the entire collection instead. That is
// harmless for a read and catastrophic for a delete — a `deleteAndGetOne` with
// only (userId, collectionId) empties the user's bookmarks or progress, and
// pgdb runs the DELETE before it notices it matched more than one row.
//
// Callers that genuinely mean "every document" must say so via
// refToFilterColumns below.
const refToColumns = (ref) => {
  if (!ref) {
    throw new Error('documentRef is required')
  }
  return isSanityRef(ref) ? { sanityId: fromSanityRef(ref) } : { repoId: ref }
}

// The same mapping for *filtering*, where a falsy ref legitimately means "not
// filtering by document at all" — listing a whole collection, or matching an
// audio queue item by its own id rather than by the document it points at.
const refToFilterColumns = (ref) => (ref ? refToColumns(ref) : {})

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
  const sanityId = (repoId && legacySanityId(repoId)) || publishedId(value)

  return {
    repoId: repoId || undefined,
    sanityId,
  }
}

// Does this row point at the document `columns` describes? The `&&` guards are
// load-bearing: exactly one column is set per row, so without them a
// `null === null` comparison would match an unrelated row of the other kind.
const matchesColumns = (row, { repoId, sanityId }) =>
  (!!repoId && row.repoId === repoId) ||
  (!!sanityId && row.sanityId === sanityId)

// Identity of the *document* a row points at, not of the column it happens to
// use. While content migrates, the same article can be held as a repoId-keyed
// row and as a sanityId-keyed one, so both have to collapse onto one key — the
// Sanity id, which is computable from a legacy repoId.
const canonicalKey = ({ repoId, sanityId }) =>
  sanityId || (repoId && legacySanityId(repoId)) || repoId

// Resolves a *client-supplied* document id to the canonical ref to store:
// `doc.meta.repoId` (not the parsed input), which for a publikator document is
// the repoId itself and for a Sanity-backed one the loader's normalized
// `sanity:`-prefixed ref.
//
// `ref` is only set for content that may live in a collection. The loader's
// publikator branch filters Elasticsearch to `type: 'Document'`, so a repoId is
// guaranteed to be an article; its Sanity branch resolves any `_type`, so
// without the gate an author, a format or a settings singleton could be
// bookmarked, progressed or queued. Keyed on `sanityType` being present rather
// than on the ref being `sanity:`-prefixed: the loader's legacy-rescue path
// deliberately keeps `meta.repoId` as the legacy repoId even though it resolved
// the document out of Sanity, so a prefix check would skip exactly those.
//
// Callers own the error messages, so both "no such document" and "not
// collectable" are reported as the absence of `ref`. `parsedRepoId` is handed
// back for the delete path, which has to stay able to remove a row whose
// document no longer resolves.
const resolveInputRef = async (inputId, { loaders }) => {
  const { repoId: parsedRepoId } = getParsedDocumentId(inputId)
  const doc = parsedRepoId
    ? await loaders.Document.byRepoId.load(parsedRepoId)
    : null
  const collectable =
    !!doc && (!doc.sanityType || isCollectableType(doc.sanityType))

  return {
    parsedRepoId,
    doc,
    ref: collectable ? doc.meta.repoId : undefined,
  }
}

module.exports = {
  refToColumns,
  refToFilterColumns,
  inputToColumns,
  matchesColumns,
  canonicalKey,
  resolveInputRef,
}
