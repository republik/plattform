const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, validateSharedSecret } = require('../../../lib/challenges')
const { TwoFactorHasToBeDisabledError, SessionTokenValidationFailed } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    verificationCode
  } = args

  const userWith2FA = {
    ...user,
    isTwoFactorEnabled: user._raw.isTwoFactorEnabled,
    isPhoneNumberVerified: user._raw.isPhoneNumberVerified,
    phoneNumberVerificationCode: user._raw.phoneNumberVerificationCode
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  if (userWith2FA.phoneNumberVerificationCode) {
    // already validated, that's fine
    return true
  }
  const type = TokenTypes.SMS
  const validated = await validateSharedSecret({
    pgdb,
    type,
    user: userWith2FA,
    payload: verificationCode
  })
  if (!validated) {
    throw new SessionTokenValidationFailed({ type, user, payload: verificationCode })
  }

  return validated
}
