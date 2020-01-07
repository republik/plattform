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
    async values => {
      const ids = values.filter(isUuid)
      const emails = values.filter(v => !ids.includes(v))

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
    (value, rows) => rows.find(row => (
      row._raw.id === value ||
      row._raw.email.toLowerCase() === value.toLowerCase()
    ))
  ),
  credential: createDataLoader(ids =>
    context.pgdb.public.credentials.find({ id: ids })
  )
})
