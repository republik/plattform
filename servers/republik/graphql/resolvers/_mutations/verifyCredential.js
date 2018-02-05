const { Roles: { ensureUserIsInRoles } } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me, t }) => {
  ensureUserIsInRoles(me, ['editor', 'admin'])

  const {
    userId,
    description
  } = args

  return pgdb.public.credentials.updateAndGetOne({
    userId,
    description
  }, {
    verified: true
  })
}
