const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { generateSharedSecret } = require('../../../lib/challenges')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    type
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
  const { tempTwoFactorSecret } = await generateSharedSecret({
    type,
    pgdb,
    user: userWith2FA
  })
  return { secret: tempTwoFactorSecret }
}
