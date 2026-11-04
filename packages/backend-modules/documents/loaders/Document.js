const createDataLoader = require('@orbiting/backend-modules-dataloader')
const {
  isSanityRef,
  fromSanityRef,
  toSanityRef,
  publishedId,
  legacySanityId,
  fetchDocumentsByIds,
  fetchArticlesByPaths,
  countArticlesByContributorUserIds,
} = require('@orbiting/backend-modules-sanity')

// Wraps a generic Sanity document into the minimal shape callers of this
// loader actually read (Collection.js's `meta.repoId` destructure,
// notification content building).
//
// Deliberately NOT a usable GraphQL `Document`: resolving one needs mdast
// content we don't have, and faking it would only produce broken teasers.
// Nothing exposes this through the `Document` type — clients read Sanity-backed
// collection items via the `userCollectionItems` query and fetch their preview
// data from Sanity.
//
// `documentRef` is the opaque document reference the rest of this chain deals
// in (see collections/lib/documentRef.js): a plain publikator repoId, or a
// `sanity:`-prefixed Sanity id. It lands on `meta.repoId` because that is the
// field callers already destructure -- the name is legacy, the value is a ref.
// `sanityType` carries the document's Sanity `_type` through to callers that
// need to reject the wrong kind of document (collections accept only articles,
// while subscriptions legitimately target formats — so the loader itself stays
// permissive). Not a GraphQL field; nothing exposes this stub as a `Document`.
//
// `sanityRef` is the canonical `sanity:`-prefixed ref for `doc`, independent
// of which key (`documentRef`) actually matched it -- a legacy repoId whose
// content has since moved to Sanity (the "rescued" case below) keeps
// `documentRef`/`meta.repoId` unprefixed on purpose (see that case's own
// comment), so callers that need to tell "is this Sanity-backed" apart from
// a still-publikator row, and build a real Sanity reference for it, must
// read this field rather than inspect `documentRef`'s shape (see
// subscriptions/lib/genericObject.js).
const toDocumentShape = (documentRef, doc) => ({
  id: documentRef,
  repoId: documentRef,
  sanityType: doc._type,
  sanityRef: toSanityRef(doc._id),
  meta: { repoId: documentRef, title: doc.title, path: doc.slug?.current },
  __typename: 'Document',
})

// Resolves repoIds, raw Sanity ids and `sanity:` refs against Sanity only, in
// one query. Returns a row (or nothing) per key, in `keys` order.
//
// A plain key can be a raw Sanity _id (a brand-new sanity-native follow/
// bookmark -- the frontend doesn't know about the `sanity:` prefix), which is
// canonicalized to the prefixed form, or a legacy repoId whose content has
// since moved to Sanity (its Sanity `_id` is derived from the repoId by the
// one-time import, see sanity/lib/legacyId.ts), which keeps the legacy value as
// `meta.repoId`.
const resolveViaSanity = async (keys, tag) => {
  const plainKeys = keys.filter((key) => !isSanityRef(key))

  const sanityDocs = await fetchDocumentsByIds(
    [
      ...keys.filter(isSanityRef).map(fromSanityRef),
      ...plainKeys,
      ...plainKeys.map(legacySanityId).filter(Boolean),
    ],
    { tag },
  )
  const sanityDocById = new Map(sanityDocs.map((doc) => [doc._id, doc]))
  const sanityDocFor = (id) => id && sanityDocById.get(publishedId(id))

  return keys.map((key) => {
    if (isSanityRef(key)) {
      const doc = sanityDocFor(fromSanityRef(key))
      return doc && toDocumentShape(key, doc)
    }

    const directDoc = sanityDocFor(key)
    if (directDoc) return toDocumentShape(toSanityRef(key), directDoc)

    const legacyDoc = sanityDocFor(legacySanityId(key))
    return legacyDoc ? toDocumentShape(key, legacyDoc) : null
  })
}

// Elasticsearch no longer serves documents: every loader below reads Sanity.
const stripSlash = (path) => (path || '').replace(/^\//, '')

module.exports = () => ({
  // Keyed by repoId, raw Sanity `_id` or `sanity:` ref. An unresolved key
  // simply means "no such document".
  byRepoId: createDataLoader(
    async (repoIds) =>
      (await resolveViaSanity(repoIds, 'documents.by-repo-id')).filter(Boolean),
    null,
    (key, rows) => rows.find((row) => row.meta.repoId === key),
  ),
  // Published articles by path, as the Document stub (title/path only).
  byPath: createDataLoader(
    async (paths) =>
      (await fetchArticlesByPaths(paths, { tag: 'documents.by-path' })).map(
        (doc) => toDocumentShape(toSanityRef(doc._id), doc),
      ),
    null,
    (key, rows) =>
      rows.find((row) => stripSlash(row.meta.path) === stripSlash(key)),
  ),
  // Number of published articles a user contributed to, `{ userId, count }`.
  // Users without a contributor document have no row.
  articleCountByUserId: createDataLoader(
    (userIds) =>
      countArticlesByContributorUserIds(userIds, {
        tag: 'documents.article-count-by-user-id',
      }),
    null,
    (key, rows) => rows.find((row) => row.userId === key),
  ),
})
