const { getParsedDocumentId } = require('../../search/lib/Documents')

const getObjectByIdAndType = ({ id, type }, { loaders, t }) => {
  const normalize = obj => {
    if (!obj) {
      return
    }
    return {
      ...obj,
      __typename: type
    }
  }
  if (['User', 'Discussion', 'Comment'].includes(type)) {
    return loaders[type].byId.load(id)
      .then(normalize)
  }
  if (type === 'Document') {
    const { repoId } = getParsedDocumentId(id)
    return loaders.Document.byRepoId.load(repoId)
      .then( o => ({...o, objectId: repoId }))
      .then(normalize)
  }
  throw new Error(t('api/subscriptions/type/notSupported'))
}

module.exports = {
  getObjectByIdAndType
}
