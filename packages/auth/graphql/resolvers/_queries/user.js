const transformUser = require('../../../lib/transformUser')
const Roles = require('../../../lib/Roles')

module.exports = async (_, args, { pgdb, user: me }) => {
  const { id, username } = args
  if (!id && !username) {
    return null
  }
  const user = await pgdb.public.users.findOne({
    id,
    username
  }, { skipUndefined: true })
  if (
    !user ||
    (!user.hasPublicProfile && Roles.userIsMe(user, me))
  ) {
    return null
  }

  return transformUser(user)
}
