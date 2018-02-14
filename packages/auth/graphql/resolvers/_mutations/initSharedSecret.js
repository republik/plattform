const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { generateSharedSecret } = require('../../../lib/challenges')
const { TwoFactorHasToBeDisabledError } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    type
  } = args

  const userWith2FA = {
    ...user,
    isTwoFactorEnabled: user._raw.isTwoFactorEnabled,
    TOTPChallengeSecret: user._raw.TOTPChallengeSecret,
    isTOTPChallengeSecretVerified: user._raw.isTOTPChallengeSecretVerified,
    isSMSChallengeSecretVerified: user._raw.isSMSChallengeSecretVerified,
    smsChallengeSecret: user._raw.smsChallengeSecret
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  const secret = await generateSharedSecret({
    type,
    pgdb,
    user: userWith2FA
  })
  return { secret }
}
