const createDataLoader = require('@orbiting/backend-modules-dataloader')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = (context) => ({
  byId: createDataLoader(ids =>
    context.pgdb.public.users.find({ id: ids })
      .then(users => users
        .map(u => transformUser(u))
      )
  ),
  credential: createDataLoader(ids =>
    context.pgdb.public.credentials.find({ id: ids })
  )
})
