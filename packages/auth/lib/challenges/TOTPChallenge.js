const OTP = require('otp')

const MIN_IN_MS = 1000 * 60

module.exports = {
  generateSharedSecret: async ({ pgdb, user }) => {
    const otp = OTP()
    return otp.secret
  },
  validateSharedSecret: async ({ pgdb, payload, user }) => {
    if (!user.tempTwoFactorSecret) return false
    const otp = OTP({ secret: user.tempTwoFactorSecret })
    return (otp.totp() === payload)
  },
  generateNewToken: async ({ pgdb, session, type, user }) => {
    const payload = user.id
    const expiresAt = new Date(new Date().getTime() + (30 * MIN_IN_MS))
    return { payload, expiresAt }
  },
  startChallenge: async (options) => {
    // time based!
    return true
  },
  validateChallenge: async ({ pgdb, token, user }) => {
    if (!user.twoFactorSecret) return false
    const otp = OTP({ secret: user.twoFactorSecret })
    return (otp.totp() === token.payload)
  }
}
