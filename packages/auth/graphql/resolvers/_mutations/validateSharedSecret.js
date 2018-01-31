const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { validateSharedSecret } = require('../../../lib/challenges')

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
    throw new Error('you have to first deactivate 2FA to re-init your shared secret')
  }
  if (userWith2FA.twoFactorSecret) {
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
    console.error('invalid challenge ')
    throw new Error('one of the challenges failed')
  }

  return validated
}
