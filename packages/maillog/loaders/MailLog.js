const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader((ids) =>
    context.pgdb.public.mailLog.find({ id: ids }),
  ),
})
