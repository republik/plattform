module.exports = async (_, { id, token }, { pgdb }) => {
  const cards = await pgdb.public.gsheets.findOneFieldOnly(
    { name: 'cards/mockUserCards' },
    'data'
  )

  const card = cards.find(card => card.id === id)

  if (!card) {
    throw new Error('api/cards/card/404')
  }

  return card
}
