const { Roles } = require('@orbiting/backend-modules-auth')

const { findAvailable } = require('../../../lib/elections')

module.exports = async (_, args, { pgdb, user: me }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'associate'])

  return findAvailable(pgdb)
}
