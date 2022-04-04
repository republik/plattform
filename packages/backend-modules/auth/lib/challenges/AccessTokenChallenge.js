const { newAuthError } = require('../AuthError')

const AccessTokenMissingError = newAuthError(
  'access-token-challenge-access-token-missing',
  'api/auth/accessToken/accessTokenMissing',
)
const TokensExceededError = newAuthError(
  'access-token-challenge-tokens-exceeded',
  'api/auth/accessToken/tokensExceeded',
)

const MAX_VALID_TOKENS = 1
const TTL = 1000 * 60 // 1 minute
const Type = 'ACCESS_TOKEN'

module.exports = {
  Type,
  generateNewToken: async ({ email, accessToken: payload, pgdb }) => {
    if (!payload) {
      console.error('Unable to generate a new token: accessToken is missing.')
      throw new AccessTokenMissingError({ email })
    }

    const tokenCount = await pgdb.public.tokens.count({
      type: Type,
      email,
      payload,
    })

    if (tokenCount >= MAX_VALID_TOKENS) {
      console.error(
        'Unable to generate a new token: Found too many valid tokens.',
      )
      throw new TokensExceededError({ email, MAX_VALID_TOKENS })
    }

    return { payload, expiresAt: new Date(new Date().getTime() + TTL) }
  },
  startChallenge: () => {}, // accessToken is generated and validated elsewhere
  validateChallenge: async ({ email, session, req, pgdb }, { payload }) => {
    if (session.sid !== req.sessionID) {
      console.warn('Faild validation, sessions did not match', { email })
      return false
    }

    const token = await pgdb.public.tokens.findOne({
      type: Type,
      email,
      payload,
      sessionId: session.id,
      'expiresAt >=': new Date(),
    })

    return token && token.id
  },
}
