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
    const payload = '' // no payload needed, time-based
    const expiresAt = new Date(new Date().getTime() + (30 * MIN_IN_MS))
    return { payload, expiresAt }
  },
  startChallenge: async (options) => {
    // no challenge transport needed, time based
    return true
  },
  validateChallenge: async ({ pgdb, payload, user }) => {
    if (!user.twoFactorSecret) return false
    const otp = OTP({ secret: user.twoFactorSecret })
    const comparablePayload = await otp.totp()
    console.log(`Validate TOTP challenge for ${user.id}: ${comparablePayload} (server) ==? ${payload} (client)`)
    return (comparablePayload === payload)
  }
}
