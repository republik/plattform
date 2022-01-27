const { Roles } = require('@orbiting/backend-modules-auth')
const { paginate } = require('@orbiting/backend-modules-utils')

const { findAll, DEFAULT_ROLES } = require('../../../lib/Redirections')

module.exports = async (_, args, { user, pgdb }) => {
  Roles.ensureUserIsInRoles(user, DEFAULT_ROLES)
  const nodes = await findAll(pgdb)

  return paginate(args, nodes)
}
