const { getParsedDocumentId } = require('../../search/lib/Documents')

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
      .then(normalize)
  }
  throw new Error(t('api/subscriptions/type/notSupported'))
}

module.exports = {
  getObjectByIdAndType,
}
