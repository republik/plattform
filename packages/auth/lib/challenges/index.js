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
    generateSharedSecret: async () => {
      if (!handler.generateSharedSecret) throw new Error('shared secret not supported', { type, options })

      const secret = await handler.generateSharedSecret({
        type,
        ...options
      })
      if (!secret) throw new Error('could not generate shared secret', { type, options })

      const { pgdb, user } = options
      return pgdb.public.users.updateAndGetOne(
        {
          id: user.id
        }, {
          tempTwoFactorSecret: secret,
          twoFactorSecret: null
        }
      )
    },
    validateSharedSecret: async () => {
      if (!handler.validateSharedSecret) throw new Error('shared secret validation not supported', { type, options })
      const validated = await handler.validateSharedSecret({
        type,
        ...options
      })

      if (!validated) throw new Error('shared secret validation failed', { type, options })
      const { pgdb, user } = options
      return pgdb.public.users.updateAndGetOne(
        {
          id: user.id
        }, {
          tempTwoFactorSecret: null,
          twoFactorSecret: user.tempTwoFactorSecret
        }
      )
    },
    generateNewToken: async () => {
      const tokenData = await handler.generateNewToken({
        type,
        ...options
      })
      const { pgdb, session, email } = options
      return pgdb.public.tokens.insertAndGet({
        sessionId: session.id,
        email,
        type,
        ...tokenData
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
  startChallenge: (options) => ChallengeHandlerProxy(options).startChallenge(),
  generateSharedSecret: (options) => ChallengeHandlerProxy(options).generateSharedSecret(),
  validateSharedSecret: (options) => ChallengeHandlerProxy(options).validateSharedSecret()
}
