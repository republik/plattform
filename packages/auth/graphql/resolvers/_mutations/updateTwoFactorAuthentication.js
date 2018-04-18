const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes } = require('../../../lib/challenges')
const {
  updateUserTwoFactorAuthentication,
  TwoFactorAlreadyEnabledError,
  TwoFactorAlreadyDisabledError,
  SecondFactorNotReadyError} = require('../../../lib/Users')

module.exports = async (_, args = { }, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    enabled,
    tokenType
  } = args

  const enabledSecondFactors = (user._raw.enabledSecondFactors || [])
  const isTokenTypeAlreadyEnabled = enabledSecondFactors.indexOf(tokenType) !== -1

  if (enabled) {
    if (isTokenTypeAlreadyEnabled) {
      throw new TwoFactorAlreadyEnabledError({ userId: user.id })
    } else if (tokenType === TokenTypes.TOTP && !user._raw.isTOTPChallengeSecretVerified) {
      throw new SecondFactorNotReadyError({ userId: user.id, tokenType })
    } else if (tokenType === TokenTypes.SMS && !user._raw.isPhoneNumberVerified) {
      throw new SecondFactorNotReadyError({ userId: user.id, tokenType })
    }
  } else if (!isTokenTypeAlreadyEnabled) {
    throw new TwoFactorAlreadyDisabledError()
  }

  const updatedEnabledSecondFactors = enabled
    ? [...new Set(enabledSecondFactors).add(tokenType)]
    : [...new Set(enabledSecondFactors).delete(tokenType)]

  const updatedUser = await updateUserTwoFactorAuthentication({
    pgdb,
    userId: user.id,
    enabledSecondFactors: updatedEnabledSecondFactors
  })
  return !!updatedUser
}
