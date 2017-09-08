const { ensureUserHasRole } = require('../../../lib/Roles')

module.exports = async (_, args, { user }) => {
  ensureUserHasRole(user, 'editor')

  return {
    id: args.id
  }
}
