const { getParsedDocumentId } = require('../../search/lib/Documents')

// Duplicated from @orbiting/backend-modules-sanity's lib/document.ts rather
// than imported: that package already depends on this one (lib/article.js
// sends notifications via @orbiting/backend-modules-subscriptions), so a
// dependency the other way would form a cycle. Keep in sync if the prefix
// ever changes.
const SANITY_ID_PREFIX = 'sanity:'
const fromSanityRef = (value) => value.slice(SANITY_ID_PREFIX.length)

// SANITY_DOCUMENT_REFS_ENABLED (pre-launch kill-switch, removable once the
// frontend can render the SanityDocumentRef union member).
//
// The currently-deployed frontend's Notification/Subscription queries only
// have a `... on Document` fragment -- they were built before this union
// member existed. Once content migrates to Sanity, Notification.object /
// Subscription.object would otherwise start resolving to SanityDocumentRef
// for it, which that frontend can't render (silently missing fields, not a
// crash, but a broken-looking notification/subscription row). Defaults to
// disabled: while off, a Sanity-backed object resolves the same way a
// deleted/not-found one already does (undefined -> null on the nullable
// object field) rather than surfacing a shape the caller can't use.
const isSanityDocumentRefsEnabled = () =>
  process.env.SANITY_DOCUMENT_REFS_ENABLED === 'true'

const getObjectByIdAndType = ({ id, type }, { loaders, t }) => {
  const normalize = (obj) => {
    if (!obj) {
      return
    }
    return {
      ...obj,
      __typename: type,
    }
  }
  if (['User', 'Discussion', 'Comment'].includes(type)) {
    return loaders[type].byId.load(id).then(normalize)
  }
  if (type === 'Document') {
    const { repoId } = getParsedDocumentId(id)
    return (
      // byRepoIdPreferSanity, not byRepoId: this resolver only ever needs a
      // teaser (title/path) for display, so it prefers a repoId's Sanity
      // copy the moment one exists, even if Elasticsearch also still has
      // it -- unlike byRepoId's consumers (e.g. publish-notification
      // content generation), which need the live Publikator copy regardless
      // of whether Sanity has an imported snapshot too (see
      // documents/loaders/Document.js for why that distinction matters).
      loaders.Document.byRepoIdPreferSanity
        .load(repoId)
        // `o.meta.repoId` (not the parsed input `repoId`) is the canonical
        // storage key — for a publikator document these are always equal;
        // for a Sanity-backed one it's the loader's normalized `sanity:`-
        // prefixed ref (see documents/loaders/Document.js).
        .then((o) => o && { ...o, objectId: o.meta.repoId })
        .then((obj) => {
          if (!obj) {
            return
          }
          // A Sanity-backed document has no resolvable GraphQL `Document`
          // (no mdast/content), so it's surfaced as its own union member
          // rather than as `Document` — the frontend needs `__typename` to
          // tell the two apart and fetch preview data from Sanity directly.
          //
          // Branch on `obj.sanityRef`, not on whether `obj.objectId` itself
          // is `sanity:`-prefixed: a legacy repoId whose content has since
          // moved to Sanity resolves through the loader's Sanity branch too
          // (see documents/loaders/Document.js's "rescued" case), but keeps
          // `objectId` unprefixed until the migration script rewrites the
          // stored row — checking `objectId`'s shape would let that case
          // fall through to `normalize(obj)` below and leak the loader's
          // minimal, non-GraphQL `Document` stub to the frontend.
          if (obj.sanityRef) {
            if (!isSanityDocumentRefsEnabled()) {
              return undefined
            }
            return {
              id: fromSanityRef(obj.sanityRef),
              type: obj.sanityType,
              objectId: obj.objectId,
              __typename: 'SanityDocumentRef',
            }
          }
          return normalize(obj)
        })
    )
  }
  throw new Error(t('api/subscriptions/type/notSupported'))
}

module.exports = {
  getObjectByIdAndType,
}
