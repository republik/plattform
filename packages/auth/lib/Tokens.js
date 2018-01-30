const EmailTokenChallenge = require('./challenges/EmailTokenChallenge')
const TOTPChallenge = require('./challenges/TOTPChallenge')

const {
  TokenTypeUnknownError
} = require('./errors')

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
  validateChallenge: (options) => ChallengeHandlerProxy(options).validateChallenge(),
  generateNewToken: (options) => ChallengeHandlerProxy(options).generateNewToken(),
  startChallenge: (options) => ChallengeHandlerProxy(options).startChallenge()
}
