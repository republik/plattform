const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byKeyObj: ({ many } = {}) => createDataLoader(keyObjs =>
    context.pgdb.public.notifications.find(
      {
        or: keyObjs.map(keyObj => ({
          and: keyObj
        }))
      },
      { orderBy: { createdAt: 'desc' } }
    ),
  { many }
  )
})
