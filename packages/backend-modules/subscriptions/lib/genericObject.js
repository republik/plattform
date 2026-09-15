const { getParsedDocumentId } = require('../../search/lib/Documents')

// Duplicated from @orbiting/backend-modules-sanity's lib/document.ts rather
// than imported: that package already depends on this one (lib/article.js
// sends notifications via @orbiting/backend-modules-subscriptions), so a
// dependency the other way would form a cycle. Keep in sync if the prefix
// ever changes.
const SANITY_ID_PREFIX = 'sanity:'
const isSanityRef = (value) => value.startsWith(SANITY_ID_PREFIX)
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
      loaders.Document.byRepoId
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
          if (isSanityRef(obj.objectId)) {
            if (!isSanityDocumentRefsEnabled()) {
              return undefined
            }
            return {
              id: fromSanityRef(obj.objectId),
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
