const { Roles } = require('@orbiting/backend-modules-auth')
const { find } = require('../../../lib/Election')

module.exports = async (_, args, { pgdb, user: me }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'associate'])

  return find(pgdb)
}
