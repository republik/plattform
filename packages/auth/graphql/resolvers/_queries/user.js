const transformUser = require('../../../lib/transformUser')
const { resolveUser } = require('../../../lib/Users')
const Roles = require('../../../lib/Roles')
const { getUserByAccessToken } = require('../../../lib/AccessToken')

module.exports = async (_, { slug, accessToken }, context) => {
  const { user: me, pgdb } = context
  if (accessToken) {
    return getUserByAccessToken(accessToken, context)
  }
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
