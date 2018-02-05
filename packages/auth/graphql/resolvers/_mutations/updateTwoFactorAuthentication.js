const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { updateUserTwoFactorAuthentication } = require('../../../lib/Users')

module.exports = async (_, args = {}, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    enabled
  } = args

  if (enabled) {
    if (!user._raw.tempTwoFactorSecret && !user._raw.twoFactorSecret) {
      throw new Error('you have to actually add and validate a second factor before you can activate 2fa')
    } else if (user._raw.isTwoFactorEnabled) {
      throw new Error('2fa already enabled')
    }
  } else {
    if (!user._raw.isTwoFactorEnabled) {
      throw new Error('2fa not enabled')
    }
  }

  const updatedUser = await updateUserTwoFactorAuthentication({ pgdb, userId: user.id, enabled })
  return !!updatedUser
}
