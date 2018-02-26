const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, generateSharedSecret } = require('../../../lib/challenges')
const { TwoFactorHasToBeDisabledError } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const userWith2FA = {
    ...user,
    isTwoFactorEnabled: user._raw.isTwoFactorEnabled,
    TOTPChallengeSecret: user._raw.TOTPChallengeSecret,
    isTOTPChallengeSecretVerified: user._raw.isTOTPChallengeSecretVerified
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  const type = TokenTypes.TOTP
  const secret = await generateSharedSecret({
    type,
    pgdb,
    user: userWith2FA
  })
  return { secret }
}
