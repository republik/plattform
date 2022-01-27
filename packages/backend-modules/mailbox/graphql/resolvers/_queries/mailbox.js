const { Roles } = require('@orbiting/backend-modules-auth')

const { getConnection } = require('../../../lib/search')

module.exports = async (_, args, { elastic, pgdb, user: me }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  return getConnection(undefined, args, { elastic, pgdb })
}
