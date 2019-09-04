const shuffleSeed = require('shuffle-seed')

const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = async (_, args, { pgdb, user }) => {
  const cards = await pgdb.public.cards.findAll()

  return paginate(
    Object.assign({}, defaults, args),
    shuffleSeed.shuffle(cards, (user && user.id) || 'Republik Rendezvous')
  )
}
