const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, validateSharedSecret } = require('../../../lib/challenges')
const { SecondFactorHasToBeDisabledError, SessionTokenValidationFailed } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    verificationCode
  } = args

  const userWith2FA = {
    ...user,
    enabledSecondFactors: user._raw.enabledSecondFactors || [],
    isPhoneNumberVerified: user._raw.isPhoneNumberVerified,
    phoneNumberVerificationCode: user._raw.phoneNumberVerificationCode
  }

  if (userWith2FA.enabledSecondFactors.indexOf(TokenTypes.SMS) !== -1) {
    throw new SecondFactorHasToBeDisabledError({ userId: user.id })
  }
  if (userWith2FA.isPhoneNumberVerified) {
    // already validated, that's fine
    return true
  }
  const type = TokenTypes.SMS
  const validated = await validateSharedSecret(type, {
    pgdb,
    user: userWith2FA
  }, { payload: verificationCode })
  if (!validated) {
    throw new SessionTokenValidationFailed({ type, user, payload: verificationCode })
  }

  return !!validated
}
