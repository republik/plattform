const transformUser = require('../../../lib/transformUser')
const Roles = require('../../../lib/Roles')

module.exports = async (_, args, { pgdb, user: me }) => {
  const { slug } = args
  if (!slug) {
    return null
  }
  const user = await pgdb.public.users.findOne({
    or: [{id: slug}, {username: slug}]
  }, { skipUndefined: true })
  if (
    !user ||
    (!user.hasPublicProfile && !Roles.userIsMe(user, me))
  ) {
    return null
  }

  return transformUser(user)
}
