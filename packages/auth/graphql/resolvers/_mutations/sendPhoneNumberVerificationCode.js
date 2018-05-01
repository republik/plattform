const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, generateSharedSecret } = require('../../../lib/challenges')
const { SecondFactorHasToBeDisabledError } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const userWith2FA = {
    ...user,
    enabledSecondFactors: user._raw.enabledSecondFactors || [],
    isPhoneNumberVerified: user._raw.isPhoneNumberVerified,
    phoneNumberVerificationCode: user._raw.phoneNumberVerificationCode
  }

  if (userWith2FA.enabledSecondFactors.indexOf(TokenTypes.SMS) !== -1) {
    throw new SecondFactorHasToBeDisabledError({ userId: user.id })
  }
  const secret = await generateSharedSecret(TokenTypes.SMS, {
    pgdb,
    user: userWith2FA
  })
  return !!secret
}
