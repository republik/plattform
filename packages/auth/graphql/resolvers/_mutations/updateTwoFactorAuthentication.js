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
    type
  } = args

  const enabledSecondFactors = (user._raw.enabledSecondFactors || [])
  const isSecondFactorEnabled = enabledSecondFactors.indexOf(type) !== -1

  if (enabled) {
    if (isSecondFactorEnabled) {
      throw new TwoFactorAlreadyEnabledError({ userId: user.id })
    } else if (type === TokenTypes.TOTP && !user._raw.isTOTPChallengeSecretVerified) {
      throw new SecondFactorNotReadyError({ userId: user.id, type })
    } else if (type === TokenTypes.SMS && !user._raw.isPhoneNumberVerified) {
      throw new SecondFactorNotReadyError({ userId: user.id, type })
    }
  } else if (!isSecondFactorEnabled) {
    throw new TwoFactorAlreadyDisabledError()
  }

  const updatedEnabledSecondFactors = new Set(enabledSecondFactors)
  enabled ? updatedEnabledSecondFactors.add(type) : updatedEnabledSecondFactors.delete(type)

  console.log(updatedEnabledSecondFactors)
  const updatedUser = await updateUserTwoFactorAuthentication({
    pgdb,
    userId: user.id,
    enabledSecondFactors: [...updatedEnabledSecondFactors]
  })
  return !!updatedUser
}
