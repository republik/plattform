const {
  Roles,
  ensureSignedIn,
  Users: {
    resolveUser,
    UserNotFoundError
  }
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args = {}, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const user = await resolveUser({ userId: me.id, pgdb })
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter', 'admin', 'associate'])
  if (!user) {
    throw new UserNotFoundError({ userId: me.id })
  }

  return {

  }
}
