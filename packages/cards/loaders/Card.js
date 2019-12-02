const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(
    ids => context.pgdb.public.cards.find({ id: ids })
  ),
  byUserId: createDataLoader(
    async userIds =>
      context.pgdb.public.cards.find({ userId: userIds }, { orderBy: { createdAt: 'ASC' } }),
    null,
    (key, rows) => rows.filter(row => row.userId === key)
  ),
  byCardGroupId: createDataLoader(
    async cardGroupIds =>
      context.pgdb.public.cards.find({ cardGroupId: cardGroupIds }, { orderBy: { createdAt: 'ASC' } }),
    null,
    (key, rows) => rows.filter(row => row.cardGroupId === key)
  )
})
