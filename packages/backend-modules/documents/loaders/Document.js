const createDataLoader = require('@orbiting/backend-modules-dataloader')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')
const {
  isSanityRef,
  fromSanityRef,
  toSanityRef,
  fetchDocumentById,
  fetchDocumentByLegacyRepoId,
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
const toDocumentShape = (documentRef, doc) => ({
  id: documentRef,
  repoId: documentRef,
  sanityType: doc._type,
  meta: { repoId: documentRef, title: doc.title, path: doc.slug?.current },
  __typename: 'Document',
})

module.exports = (context) => ({
  byId: createDataLoader(
    (ids) =>
      search(
        null,
        {
          filter: {
            ids,
            type: 'Document',
          },
          first: ids.length * 2,
          unrestricted: true,
        },
        context,
      ).then((connection) => connection.nodes.map((node) => node.entity)),
    null,
    (key, rows) => rows.find((row) => row.id === key),
  ),
  byRepoId: createDataLoader(
    async (repoIds) => {
      const sanityRefKeys = repoIds.filter(isSanityRef)
      const plainKeys = repoIds.filter((id) => !isSanityRef(id))

      const esRows = plainKeys.length
        ? await search(
            null,
            {
              filter: {
                repoId: plainKeys,
                type: 'Document',
              },
              first: plainKeys.length * 2,
              unrestricted: true,
            },
            context,
          ).then((connection) => connection.nodes.map((node) => node.entity))
        : []

      // Explicitly-prefixed keys are already known to be Sanity-backed —
      // resolve directly by _id, no ES call.
      const directSanityRows = await Promise.all(
        sanityRefKeys.map(async (key) => {
          const doc = await fetchDocumentById(fromSanityRef(key))
          return doc && toDocumentShape(key, doc)
        }),
      )

      // A plain key ES didn't match might be a brand-new Sanity id (the
      // frontend doesn't know about the `sanity:` prefix yet) or a legacy
      // repoId whose content has since moved to Sanity (its Sanity `_id` is
      // deterministically derived from the repoId by the one-time import —
      // see sanity/lib/legacyId.ts). Try both rescue paths before giving up.
      const unmatchedPlainKeys = plainKeys.filter(
        (id) => !esRows.some((row) => row.meta.repoId === id),
      )
      const rescuedRows = await Promise.all(
        unmatchedPlainKeys.map(async (key) => {
          // Case 1: `key` is itself a raw Sanity _id (a brand-new
          // sanity-native follow/bookmark — the frontend doesn't know about
          // the `sanity:` prefix). Canonicalize to the prefixed form so a
          // caller writing this back (e.g. a fresh `subscribe`) stores the
          // form future reads will hit via the fast, ES-skipping path above.
          const directDoc = await fetchDocumentById(key)
          if (directDoc) return toDocumentShape(toSanityRef(key), directDoc)

          // Case 2: `key` is a legacy repoId whose content has since moved
          // to Sanity. Keep `meta.repoId` as the legacy value — this only
          // needs to keep an *existing* stored row resolvable; rewriting it
          // to the new canonical form is the migration script's job, not a
          // side effect of a read.
          const legacyDoc = await fetchDocumentByLegacyRepoId(key)
          return legacyDoc && toDocumentShape(key, legacyDoc)
        }),
      )

      return [
        ...esRows,
        ...directSanityRows.filter(Boolean),
        ...rescuedRows.filter(Boolean),
      ]
    },
    null,
    (key, rows) => rows.find((row) => row.meta.repoId === key),
  ),
})
