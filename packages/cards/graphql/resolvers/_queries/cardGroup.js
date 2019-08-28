module.exports = async (_, { id, token }, { loaders }) => {
  const group = await loaders.CardGroup.byId.load(id)

  if (!group) {
    throw new Error('api/cards/group/404')
  }

  return group
}
