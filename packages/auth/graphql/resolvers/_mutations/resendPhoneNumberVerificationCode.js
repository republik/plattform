const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, generateSharedSecret } = require('../../../lib/challenges')
const { TwoFactorHasToBeDisabledError } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const userWith2FA = {
    ...user,
    isTwoFactorEnabled: user._raw.isTwoFactorEnabled,
    isPhoneNumberVerified: user._raw.isPhoneNumberVerified,
    phoneNumberVerificationCode: user._raw.phoneNumberVerificationCode
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  const type = TokenTypes.SMS
  const secret = await generateSharedSecret({
    type,
    pgdb,
    user: userWith2FA
  })
  return { secret }
}
