const { Roles } = require('@orbiting/backend-modules-auth')

const { update, DEFAULT_ROLES } = require('../../../lib/Redirections')

module.exports = async (_, args, { user, pgdb }) => {
  Roles.ensureUserIsInRoles(user, DEFAULT_ROLES)

  return update(args, pgdb)
}
