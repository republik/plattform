const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  clear: async (userId) => {
    const {
      loaders: {
        DiscussionSuspension: { byUserId, byUserIdWithInactive },
      },
    } = context

    byUserId.clear(userId)
    byUserIdWithInactive.clear(userId)
  },
  byUserId: createDataLoader(
    (userIds) => {
      const now = new Date()

      return context.pgdb.public.discussionSuspensions.find({
        userId: userIds,
        'beginAt <=': now,
        'endAt >=': now,
      })
    },
    null,
    (key, rows) => rows.filter((row) => row.userId === key),
  ),
  byUserIdWithInactive: createDataLoader(
    (userIds) =>
      context.pgdb.public.discussionSuspensions.find({
        userId: userIds,
      }),
    null,
    (key, rows) => rows.filter((row) => row.userId === key),
  ),
})
