const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { validateSharedSecret } = require('../../../lib/challenges')
const { TwoFactorHasToBeDisabledError, SessionTokenValidationFailed } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    type,
    payload
  } = args

  const userWith2FA = {
    ...user,
    isTwoFactorEnabled: user._raw.isTwoFactorEnabled,
    tempTwoFactorSecret: user._raw.tempTwoFactorSecret,
    twoFactorSecret: user._raw.twoFactorSecret
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  if (userWith2FA.twoFactorSecret && !userWith2FA.tempTwoFactorSecret) {
    // already validated, that's fine
    return true
  }

  const validated = await validateSharedSecret({
    pgdb,
    type,
    user: userWith2FA,
    payload
  })
  if (!validated) {
    throw new SessionTokenValidationFailed({ type, user, payload })
  }

  return validated
}
