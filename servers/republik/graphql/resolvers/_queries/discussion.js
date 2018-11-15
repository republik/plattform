module.exports = async (_, { id }, { loaders }) =>
  loaders.Discussion.byId.load(id)
