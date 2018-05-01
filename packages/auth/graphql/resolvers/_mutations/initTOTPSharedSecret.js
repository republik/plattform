const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, generateSharedSecret } = require('../../../lib/challenges')
const { SecondFactorHasToBeDisabledError } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const userWith2FA = {
    ...user,
    enabledSecondFactors: user._raw.enabledSecondFactors || [],
    TOTPChallengeSecret: user._raw.TOTPChallengeSecret,
    isTOTPChallengeSecretVerified: user._raw.isTOTPChallengeSecretVerified
  }

  if (userWith2FA.enabledSecondFactors.indexOf(TokenTypes.TOTP) !== -1) {
    throw new SecondFactorHasToBeDisabledError({ userId: user.id })
  }
  const secret = await generateSharedSecret(TokenTypes.TOTP, {
    pgdb,
    user: userWith2FA
  })
  return { secret }
}
