const OTP = require('otp')

const MIN_IN_MS = 1000 * 60

module.exports = {
  generateNewToken: async ({ pgdb, session, type, user }) => {
    const payload = user.id
    const expireAt = new Date(new Date().getTime() + (30 * MIN_IN_MS))
    return pgdb.public.tokens.insertAndGet({
      sessionId: session.id,
      payload,
      expireAt,
      type
    })
  },
  startChallenge: async (options) => {
    // time based!
    return true
  },
  validateChallenge: async ({ pgdb, token, user }) => {
    const otp = OTP({ secret: user.twoFactorSecret })
    return (otp.totp() === token.payload)
  }
}
