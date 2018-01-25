const OTP = require('otp')

const TokenTypes = {
  EMAIL_TOKEN: 'EMAIL_TOKEN',
  TOTP: 'TOTP'
}

const validateTimeBasedPassword = async ({ totp, sharedSecret }) => {
  const otp = OTP({ secret: sharedSecret })
  return (otp.totp() === totp)
}

const findToken = (tokens, type) => {
  if (!type || !tokens || tokens.length === 0) return null
  return tokens
    .reduce((previous, token) => (
      token.type === type
        ? token
        : previous
      ), null)
}

module.exports = { validateTimeBasedPassword, findToken, TokenTypes }
