const EmailTokenChallenge = require('./EmailTokenChallenge')
const EmailCodeChallenge = require('./EmailCodeChallenge')
const TOTPChallenge = require('./TOTPChallenge')
const SMSCodeChallenge = require('./SMSCodeChallenge')
const AppChallenge = require('./AppChallenge')

const { newAuthError } = require('../AuthError')

const TokenTypeUnknownError = newAuthError('token-type-unknown', 'api/auth/tokenType/404')
const SharedSecretNotSupported = newAuthError('shared-secret-not-supported', 'api/auth/shared-secret-not-supported')
const SharedSecretGenerationFailed = newAuthError('shared-secret-generation-failed', 'api/auth/shared-secret-generation-failed')
const SharedSecretValidationFailed = newAuthError('shared-secret-validation-failed', 'api/auth/shared-secret-validation-failed')
const TokenExpiredError = newAuthError('token-expired', 'api/auth/token-expired')

const TokenTypeMap = {
  [EmailTokenChallenge.Type]: EmailTokenChallenge,
  [EmailCodeChallenge.Type]: EmailCodeChallenge,
  [TOTPChallenge.Type]: TOTPChallenge,
  [SMSCodeChallenge.Type]: SMSCodeChallenge,
  [AppChallenge.Type]: AppChallenge
}

const TokenTypes = Object
  .keys(TokenTypeMap)
  .reduce((accumulator, tokenType) => ({
    ...accumulator,
    [tokenType]: tokenType
  }), {})

const ChallengeHandlerProxy = (type, options) => {
  const handler = TokenTypeMap[type]
  if (!handler) throw new TokenTypeUnknownError({ type })
  return {
    generateSharedSecret: async () => {
      if (!handler.generateSharedSecret) throw new SharedSecretNotSupported({ type, user: options.user })
      const secret = await handler.generateSharedSecret(options)
      if (!secret) throw new SharedSecretGenerationFailed({ type, user: options.user })
      return secret
    },
    validateSharedSecret: async (sharedSecret) => {
      if (!handler.validateSharedSecret) throw new SharedSecretNotSupported({ type, user: options.user })
      const validated = await handler.validateSharedSecret(options, sharedSecret)
      if (!validated) throw new SharedSecretValidationFailed({ type, user: options.user })
      return validated
    },
    generateNewToken: async () => {
      const tokenData = await handler.generateNewToken(options)
      const { pgdb, session, email, context } = options
      return pgdb.public.tokens.insertAndGet({
        sessionId: session.id,
        email,
        type,
        ...tokenData,
        context
      })
    },
    startChallenge: async () => {
      return handler.startChallenge(options)
    },
    validateChallenge: async (token) => {
      const { payload } = token
      const { session } = options
      const { tokenExpiresAt, id } = session
      if (tokenExpiresAt.getTime() < (new Date()).getTime() || !id) {
        throw new TokenExpiredError({ type, payload, expiredAt: tokenExpiresAt, sessionId: session.id })
      }

      return handler.validateChallenge(options, token)
    }
  }
}

module.exports = {
  TokenTypes,
  TokenTypeUnknownError,
  SharedSecretNotSupported,
  SharedSecretGenerationFailed,
  SharedSecretValidationFailed,
  validateChallenge: (type, options, token) => ChallengeHandlerProxy(type, options).validateChallenge(token),
  generateNewToken: (type, options) => ChallengeHandlerProxy(type, options).generateNewToken(),
  startChallenge: (type, options) => ChallengeHandlerProxy(type, options).startChallenge(),
  generateSharedSecret: (type, options) => ChallengeHandlerProxy(type, options).generateSharedSecret(),
  validateSharedSecret: (type, options, sharedSecret) => ChallengeHandlerProxy(type, options).validateSharedSecret(sharedSecret)
}
