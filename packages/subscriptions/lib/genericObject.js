const getObjectByIdAndType = ({ id, type }, { loaders, t }) => {
  const addType = o => ({
    ...o,
    __typename: type
  })
  if (['User', 'Discussion', 'Comment'].includes(type)) {
    return loaders[type].byId.load(id)
      .then(addType)
  }
  if (type === 'Document') {
    return loaders.Document.byRepoId.load(id)
      .then(addType)
  }
  throw new Error(t('api/subscriptions/type/notSupported'))
}

module.exports = {
  getObjectByIdAndType
}
