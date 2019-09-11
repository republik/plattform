const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(ids =>
    context.pgdb.public.subscriptions.find({ id: ids })
  ),
  byUserIdNodes: createDataLoader(userIds =>
    context.pgdb.public.subscriptions.find({ userId: userIds }),
    null,
    (key, rows) => {
      return rows.filter(row => row.userId === key)
    }
  ),
  byObjectUserIdNodes: createDataLoader(objectUserIds =>
    context.pgdb.public.subscriptions.find({ objectUserId: objectUserIds }),
    null,
    (key, rows) => {
      return rows.filter(row => row.objectUserId === key)
    }
  )

})
