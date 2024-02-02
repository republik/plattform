const { getUserByAccessToken } = require('../../../lib/AccessToken')
const { resolveUser } = require('../../../lib/Users')
const { resolveUserByReferralCode } = require('../../../lib/ReferralCode')
const Roles = require('../../../lib/Roles')
const transformUser = require('../../../lib/transformUser')

module.exports = async (
  _,
  { slug, id, accessToken, referralCode },
  context,
) => {
  // use access token to return user
  if (!slug && !id && accessToken) {
    return getUserByAccessToken(accessToken, context)
  }

  if (!slug && !id && !referralCode) {
    return null
  }

  const { user: me, pgdb } = context

  let user
  if (slug || id) {
    user = await resolveUser({ slug, userId: id, pgdb })
  } else if (referralCode) {
    user = await resolveUserByReferralCode(referralCode, pgdb)
  }

  if (
    !user ||
    (user.deletedAt && !Roles.userIsInRoles(me, ['admin', 'supporter']))
  ) {
    return null
  }

  if (
    Roles.userIsInRoles(me, ['admin', 'supporter']) ||
    Roles.userIsMeOrProfileVisible(user, me)
  ) {
    return transformUser(user)
  }

  return null
}
