const DataLoader = require('dataloader')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = (context) => ({
  byId: new DataLoader( ids =>
    context.pgdb.public.users.find({ id: ids })
      .then(users => users
        .map(u => transformUser(u))
      )
  ),
  credential: new DataLoader( ids =>
    context.pgdb.public.credentials.find({ id: ids })
  )
})
