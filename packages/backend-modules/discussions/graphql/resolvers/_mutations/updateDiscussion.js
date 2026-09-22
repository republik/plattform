const { Roles } = require('@orbiting/backend-modules-auth')
const Discussion = require('../../../lib/Discussion')

module.exports = async (_, args, { pgdb, user, t }) => {
  Roles.ensureUserIsInRoles(user, ['editor', 'admin'])

  return Discussion.update(args, { pgdb, t })
}
