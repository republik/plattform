const ensureSignedIn = require('../../../lib/ensureSignedIn')
const {
  updateUserTwoFactorAuthentication,
  TwoFactorAlreadyEnabledError,
  TwoFactorAlreadyDisabledError,
  SecondFactorNotReadyError} = require('../../../lib/Users')

module.exports = async (_, args = {}, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    enabled
  } = args

  if (enabled) {
    if (!user._raw.isTOTPChallengeSecretVerified && !user._raw.isSMSChallengeSecretVerified) {
      throw new SecondFactorNotReadyError({ userId: user.id })
    } else if (user._raw.isTwoFactorEnabled) {
      throw new TwoFactorAlreadyEnabledError({ userId: user.id })
    }
  } else if (!user._raw.isTwoFactorEnabled) {
    throw new TwoFactorAlreadyDisabledError()
  }

  const updatedUser = await updateUserTwoFactorAuthentication({ pgdb, userId: user.id, enabled })
  return !!updatedUser
}
