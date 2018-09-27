const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')

const getElections = require('../../../lib/getElections')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'associate'])

  return getElections(pgdb, me)
}
