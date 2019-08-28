const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(
    ids => context.pgdb.public.cards.find({ id: ids })
  ),
  byUserId: createDataLoader(
    userIds => context.pgdb.public.cards.find({ userId: userIds }),
    null,
    (key, rows) => rows.filter(row => row.userId === key)
  ),
  byCardGroupId: createDataLoader(
    cardGroupIds => context.pgdb.public.cards.find({ cardGroupId: cardGroupIds }),
    null,
    (key, rows) => rows.filter(row => row.cardGroupId === key)
  )
})
