const { Roles } = require('@orbiting/backend-modules-auth')

const { findAll, DEFAULT_ROLES } = require('../../../lib/Redirections')

module.exports = async (_, args, { user, pgdb }) => {
  Roles.ensureUserIsInRoles(user, DEFAULT_ROLES)

  const { limit = 10, offset = 0 } = args

  return findAll(limit, offset, pgdb)
}
