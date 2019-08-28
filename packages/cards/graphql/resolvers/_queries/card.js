module.exports = async (_, { id, token }, { loaders }) => {
  const card = await loaders.Card.byId.load(id)

  if (!card) {
    throw new Error('api/cards/card/404')
  }

  return card
}
