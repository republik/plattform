const createDataLoader = require('@orbiting/backend-modules-dataloader')
const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')
const {
  isSanityRef,
  fromSanityRef,
  toSanityRef,
  publishedId,
  legacySanityId,
  fetchDocumentsByIds,
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

      // A plain key ES didn't match might be a brand-new Sanity id (the
      // frontend doesn't know about the `sanity:` prefix yet) or a legacy
      // repoId whose content has since moved to Sanity (its Sanity `_id` is
      // deterministically derived from the repoId by the one-time import —
      // see sanity/lib/legacyId.ts).
      const unmatchedPlainKeys = plainKeys.filter(
        (id) => !esRows.some((row) => row.meta.repoId === id),
      )

      // Every id this batch could possibly match is *computed*, never resolved,
      // so all of them — the explicitly-prefixed keys plus both rescue
      // candidates per unmatched plain key — go into a single Sanity query.
      // This is a dataloader; asking per key would make its Sanity path N+1 by
      // construction, on the branch that grows as content migrates.
      const sanityDocs = await fetchDocumentsByIds([
        ...sanityRefKeys.map(fromSanityRef),
        ...unmatchedPlainKeys,
        ...unmatchedPlainKeys.map(legacySanityId).filter(Boolean),
      ])
      const sanityDocById = new Map(sanityDocs.map((doc) => [doc._id, doc]))
      const sanityDocFor = (id) => id && sanityDocById.get(publishedId(id))

      // Explicitly-prefixed keys are already known to be Sanity-backed.
      const directSanityRows = sanityRefKeys.map((key) => {
        const doc = sanityDocFor(fromSanityRef(key))
        return doc && toDocumentShape(key, doc)
      })

      const rescuedRows = unmatchedPlainKeys.map((key) => {
        // Case 1: `key` is itself a raw Sanity _id (a brand-new sanity-native
        // follow/bookmark — the frontend doesn't know about the `sanity:`
        // prefix). Canonicalize to the prefixed form so a caller writing this
        // back (e.g. a fresh `subscribe`) stores the form future reads will hit
        // via the fast, ES-skipping path above.
        const directDoc = sanityDocFor(key)
        if (directDoc) return toDocumentShape(toSanityRef(key), directDoc)

        // Case 2: `key` is a legacy repoId whose content has since moved
        // to Sanity. Keep `meta.repoId` as the legacy value — this only
        // needs to keep an *existing* stored row resolvable; rewriting it
        // to the new canonical form is the migration script's job, not a
        // side effect of a read.
        const legacyDoc = sanityDocFor(legacySanityId(key))
        return legacyDoc && toDocumentShape(key, legacyDoc)
      })

      return [
        ...esRows,
        ...directSanityRows.filter(Boolean),
        ...rescuedRows.filter(Boolean),
      ]
    },
    null,
    (key, rows) => rows.find((row) => row.meta.repoId === key),
  ),
  // Same repoId/Sanity-ref resolution as `byRepoId`, but with priority
  // reversed: a repoId whose content exists in Sanity resolves to that
  // (deliberately not gated on whether Elasticsearch also still has it --
  // Studio's one-time import already covers most repos, and ES isn't purged
  // on import, so `byRepoId`'s "ES wins if present" would otherwise keep
  // resolving already-migrated content as if it hadn't moved). Only falls
  // back to the Elasticsearch/Publikator copy for a repoId Sanity has
  // nothing for yet.
  //
  // Deliberately its own loader, not a change to `byRepoId` itself:
  // `byRepoId` is shared by consumers that need the *live*, actively-edited
  // Publikator copy regardless of whether Sanity also has an imported
  // snapshot -- notably publikator/lib/Notifications.js's `notifyPublish`,
  // which reads `doc.meta.shortTitle`/`doc.meta.description` off it to build
  // real push/email content; this loader's Sanity-backed rows only ever
  // carry `toDocumentShape`'s minimal title/path. Flipping `byRepoId`
  // itself would silently degrade that content for every repo Studio has
  // ever imported. This loader is for Notification.object/Subscription.object
  // display only (see subscriptions/lib/genericObject.js), which only needs
  // a teaser and wants to point at Sanity as soon as it can -- collapse this
  // into `byRepoId` once Publikator is fully retired and nothing needs the
  // live-Publikator-first behavior anymore.
  byRepoIdPreferSanity: createDataLoader(
    async (repoIds) => {
      const sanityRefKeys = repoIds.filter(isSanityRef)
      const plainKeys = repoIds.filter((id) => !isSanityRef(id))

      const sanityDocs = await fetchDocumentsByIds([
        ...sanityRefKeys.map(fromSanityRef),
        ...plainKeys,
        ...plainKeys.map(legacySanityId).filter(Boolean),
      ])
      const sanityDocById = new Map(sanityDocs.map((doc) => [doc._id, doc]))
      const sanityDocFor = (id) => id && sanityDocById.get(publishedId(id))

      const directSanityRows = sanityRefKeys.map((key) => {
        const doc = sanityDocFor(fromSanityRef(key))
        return doc && toDocumentShape(key, doc)
      })

      const plainKeyResults = plainKeys.map((key) => {
        // Case 1: `key` is itself a raw Sanity _id (a brand-new sanity-native
        // follow/bookmark).
        const directDoc = sanityDocFor(key)
        if (directDoc) return toDocumentShape(toSanityRef(key), directDoc)

        // Case 2: `key` is a repoId Sanity already has content for --
        // prefer it over Elasticsearch even if ES still has a copy too.
        const legacyDoc = sanityDocFor(legacySanityId(key))
        if (legacyDoc) return toDocumentShape(key, legacyDoc)

        // Case 3: nothing in Sanity for this repoId yet -- resolved below
        // via Elasticsearch.
        return null
      })

      const missingKeys = plainKeys.filter((key, i) => !plainKeyResults[i])

      const esRows = missingKeys.length
        ? await search(
            null,
            {
              filter: {
                repoId: missingKeys,
                type: 'Document',
              },
              first: missingKeys.length * 2,
              unrestricted: true,
            },
            context,
          ).then((connection) => connection.nodes.map((node) => node.entity))
        : []

      return [
        ...directSanityRows.filter(Boolean),
        ...plainKeyResults.filter(Boolean),
        ...esRows,
      ]
    },
    null,
    (key, rows) => rows.find((row) => row.meta.repoId === key),
  ),
})
