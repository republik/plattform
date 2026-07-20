const { Roles } = require('@orbiting/backend-modules-auth')
const Discussion = require('../../../lib/Discussion')

module.exports = async (_, args, { pgdb, user, t }) => {
  Roles.ensureUserIsInRoles(user, ['editor', 'admin'])

  const discussion = await Discussion.create(args, { pgdb, t })

  return discussion.id
}
