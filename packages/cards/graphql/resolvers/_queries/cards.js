const shuffleSeed = require('shuffle-seed')

const { AccessToken: { getUserByAccessToken } } = require('@orbiting/backend-modules-auth')
const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = async (_, args, context) => {
  const { pgdb, loaders } = context
  const { accessToken } = args

  const user = accessToken && await getUserByAccessToken(accessToken, context)

  if (accessToken && !user) {
    return paginate(
      Object.assign({}, defaults, args),
      []
    )
  }

  const cards = user
    ? await loaders.Card.byUserId.load(user.id)
    : await pgdb.public.cards.findAll()

  console.log(cards)

  return paginate(
    Object.assign({}, defaults, args),
    shuffleSeed.shuffle(cards, (user && user.id) || 'Republik Rendezvous')
  )
}
