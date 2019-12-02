const { AccessToken: { getUserByAccessToken } } = require('@orbiting/backend-modules-auth')

const { paginateCards } = require('../../../lib/cards')

module.exports = async (_, args, context) => {
  const { pgdb, loaders } = context
  const { accessToken } = args

  const user = accessToken && await getUserByAccessToken(accessToken, context)

  if (accessToken && !user) {
    return paginateCards(args, [])
  }

  const cards = user
    ? await loaders.Card.byUserId.load(user.id)
    : await pgdb.public.cards.find({}, { orderBy: { createdAt: 'ASC' } })

  return paginateCards(cards, args, context)
}
