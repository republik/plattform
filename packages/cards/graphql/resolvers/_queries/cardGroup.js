module.exports = async (_, { id, slug }, { loaders }) => {
  if (id) {
    return loaders.CardGroup.byId.load(id)
  }

  return loaders.CardGroup.bySlug.load(slug)
}
