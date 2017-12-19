const transformUser = require('../../../lib/transformUser')
const Roles = require('../../../lib/Roles')
const isUUID = require('is-uuid')

module.exports = async (_, args, { pgdb, user: me }) => {
  const { slug } = args
  if (!slug) {
    return null
  }
  const user = await pgdb.public.users.findOne(
    isUUID.v4(slug)
      ? {id: slug}
      : {username: slug}
  )
  if (
    !user ||
    (!user.hasPublicProfile && !Roles.userIsMe(user, me))
  ) {
    return null
  }

  return transformUser(user)
}
