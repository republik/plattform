const TokenTypes = {
  EMAIL_TOKEN: 'EMAIL_TOKEN',
  TOTP: 'TOTP'
}

const validateTimeBasedPassword = async ({ totp, sharedSecret }) => {
  return false
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

module.exports = { validateTimeBasedPassword, findToken }
