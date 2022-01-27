const OTP = require('otp')

const TTL = 1000 * 30 // 30s
const Type = 'TOTP'

module.exports = {
  Type,
  generateSharedSecret: async ({ pgdb, user }) => {
    const otp = OTP()
    if (!otp.secret) return false
    await pgdb.public.users.updateAndGetOne(
      {
        id: user.id,
      },
      {
        TOTPChallengeSecret: otp.secret,
        isTOTPChallengeSecretVerified: false,
      },
    )
    return otp.secret
  },
  validateSharedSecret: async ({ pgdb, user }, { payload }) => {
    if (!user.TOTPChallengeSecret) return false
    const otp = OTP({ secret: user.TOTPChallengeSecret })
    if (otp.totp() !== payload) return false
    await pgdb.public.users.updateAndGetOne(
      {
        id: user.id,
      },
      {
        isTOTPChallengeSecretVerified: true,
      },
    )
    return true
  },
  generateNewToken: async ({ pgdb, session, user }) => {
    const payload = '' // no payload needed, time-based
    const expiresAt = new Date(new Date().getTime() + TTL)
    return { payload, expiresAt }
  },
  startChallenge: async (options) => {
    // no challenge transport needed, time based
    return true
  },
  validateChallenge: async ({ pgdb, user }, { payload }) => {
    if (!user.isTOTPChallengeSecretVerified) return false
    const otp = OTP({ secret: user.TOTPChallengeSecret })
    const comparablePayload = await otp.totp()
    return comparablePayload === payload
  },
}
