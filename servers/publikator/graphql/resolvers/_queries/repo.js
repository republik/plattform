const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { user }) => {
  ensureUserHasRole(user, 'editor')

  return {
    id: args.id
  }
}
