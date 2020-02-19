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
    return loaders.Document.byRepoId.load(id)
      .then(normalize)
  }
  throw new Error(t('api/subscriptions/type/notSupported'))
}

module.exports = {
  getObjectByIdAndType
}
