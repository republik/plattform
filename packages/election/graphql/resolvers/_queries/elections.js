const getElections = require('../../../lib/getElections')

const {
  Roles,
  ensureSignedIn
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'support', 'associate'])

  return getElections(pgdb)
}
