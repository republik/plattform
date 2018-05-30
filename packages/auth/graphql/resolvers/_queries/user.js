const transformUser = require('../../../lib/transformUser')
const { resolveUser } = require('../../../lib/Users')
const Roles = require('../../../lib/Roles')

module.exports = async (_, { slug }, { user: me, pgdb }) => {
  if (!slug) {
    return null
  }

  const user = await resolveUser({ slug, pgdb })

  if (
    user &&
    (
      user.hasPublicProfile ||
      Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])
    )
  ) {
    return transformUser(user)
  }

  return null
}
