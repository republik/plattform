const EmailTokenChallenge = require('./EmailTokenChallenge')
const TOTPChallenge = require('./TOTPChallenge')
const AuthError = require('../AuthError')

const ERROR_TOKEN_TYPE_UNKNOWN = 'token-type-unknown'

class TokenTypeUnknownError extends AuthError {
  constructor (meta) {
    super(ERROR_TOKEN_TYPE_UNKNOWN, meta)
  }
}

const TokenTypes = {
  EMAIL_TOKEN: 'EMAIL_TOKEN',
  TOTP: 'TOTP'
}

const TokenTypeMap = {
  [TokenTypes.EMAIL_TOKEN]: EmailTokenChallenge,
  [TokenTypes.TOTP]: TOTPChallenge
}

const ChallengeHandlerProxy = ({ type, ...options }) => {
  const handler = TokenTypeMap[type]
  if (!handler) throw new TokenTypeUnknownError({ type })
  return {
    generateNewToken: async () => {
      return handler.generateNewToken({
        type,
        ...options
      })
    },
    startChallenge: async () => {
      return handler.startChallenge({
        type,
        ...options
      })
    },
    validateChallenge: async () => {
      return handler.validateChallenge({
        type,
        ...options
      })
    }
  }
}

module.exports = {
  TokenTypes,
  TokenTypeUnknownError,
  validateChallenge: (options) => ChallengeHandlerProxy(options).validateChallenge(),
  generateNewToken: (options) => ChallengeHandlerProxy(options).generateNewToken(),
  startChallenge: (options) => ChallengeHandlerProxy(options).startChallenge()
}
