const { getParsedDocumentId } = require('../../search/lib/Documents')

// Duplicated from @orbiting/backend-modules-sanity's lib/document.ts rather
// than imported: that package already depends on this one (lib/article.js
// sends notifications via @orbiting/backend-modules-subscriptions), so a
// dependency the other way would form a cycle. Keep in sync if the prefix
// ever changes.
const SANITY_ID_PREFIX = 'sanity:'
const isSanityRef = (value) => value.startsWith(SANITY_ID_PREFIX)
const fromSanityRef = (value) => value.slice(SANITY_ID_PREFIX.length)

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
    return loaders.Document.byRepoId
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
          const sanityId = fromSanityRef(obj.objectId)
          return {
            id: sanityId,
            sanityId,
            objectId: obj.objectId,
            __typename: 'SanityDocumentRef',
          }
        }
        return normalize(obj)
      })
  }
  throw new Error(t('api/subscriptions/type/notSupported'))
}

module.exports = {
  getObjectByIdAndType,
}
