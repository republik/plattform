const { v4: isUuid } = require('is-uuid')

const createDataLoader = require('@orbiting/backend-modules-dataloader')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = (context) => ({
  byId: createDataLoader(ids =>
    context.pgdb.public.users.find({ id: ids })
      .then(users => users
        .map(u => transformUser(u))
      )
  ),
  byIdOrEmail: createDataLoader(
    async arrays => {
      const values = arrays.flat().filter(Boolean)
      const ids = values.flat().filter(isUuid)
      const emails = values.flat().filter(v => !isUuid(v))

      const or = [
        ids.length > 0 && { id: ids },
        emails.length > 0 && { email: emails }
      ].filter(Boolean)

      if (or.length === 0) {
        return []
      }

      return context.pgdb.public.users.find({ or }).then(users => users.map(transformUser))
    },
    null,
    (array, rows) => rows.find(row => {
      const values = array.filter(Boolean).map(value => value.toLowerCase())
      return values.includes(row._raw.id) || values.includes(row._raw.email.toLowerCase())
    })
  ),
  credential: createDataLoader(ids =>
    context.pgdb.public.credentials.find({ id: ids })
  )
})
