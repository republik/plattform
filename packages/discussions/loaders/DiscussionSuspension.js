const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
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
})
