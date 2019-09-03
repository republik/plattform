module.exports = async (_, { id, slug }, { loaders }) => {
  const group = id
    ? await loaders.CardGroup.byId.load(id)
    : await loaders.CardGroup.bySlug.load(slug)

  if (!group) {
    throw new Error('api/cards/group/404')
  }

  return group
}
