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
    tempTwoFactorSecret: user._raw.tempTwoFactorSecret,
    twoFactorSecret: user._raw.twoFactorSecret
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  const { tempTwoFactorSecret } = await generateSharedSecret({
    type,
    pgdb,
    user: userWith2FA
  })
  return { secret: tempTwoFactorSecret }
}
