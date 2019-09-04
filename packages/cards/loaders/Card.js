const shuffleSeed = require('shuffle-seed')

const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(
    ids => context.pgdb.public.cards.find({ id: ids })
  ),
  byUserId: createDataLoader(
    async userIds => {
      const cards = await context.pgdb.public.cards.find({ userId: userIds })
      return shuffleSeed.shuffle(cards, (context.user && context.user.id) || 'Republik Rendezvous')
    },
    null,
    (key, rows) => rows.filter(row => row.userId === key)
  ),
  byCardGroupId: createDataLoader(
    async cardGroupIds => {
      const cards = await context.pgdb.public.cards.find({ cardGroupId: cardGroupIds })
      return shuffleSeed.shuffle(cards, (context.user && context.user.id) || 'Republik Rendezvous')
    },
    null,
    (key, rows) => rows.filter(row => row.cardGroupId === key)
  )
})
