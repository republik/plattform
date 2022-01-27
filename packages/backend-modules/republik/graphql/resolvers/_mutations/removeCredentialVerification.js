const {
  Roles: { ensureUserIsInRoles },
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me, t }) => {
  ensureUserIsInRoles(me, ['supporter', 'admin'])

  const { id } = args

  return pgdb.public.credentials.updateAndGetOne(
    {
      id,
    },
    {
      verified: false,
    },
  )
}
