const { Roles } = require('@orbiting/backend-modules-auth')

const { add, DEFAULT_ROLES } = require('../../../lib/Redirections')

module.exports = async (_, args, { user, pgdb }) => {
  Roles.ensureUserIsInRoles(user, DEFAULT_ROLES)

  return add(args, pgdb)
}
