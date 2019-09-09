module.exports = async (_, { id }, { loaders }) => loaders.Card.byId.load(id)
