const { newAuthError } = require('../AuthError')

const TokensExceededError = newAuthError('email-code-challenge-tokens-exceeded', 'api/auth/authorizeToken/tokensExceeded')

const MAX_VALID_TOKENS = 5
const TTL = 1000 * 60 * 10 // 10 minutes
const Type = 'AUTHORIZE_TOKEN'

module.exports = {
  Type,
  generateNewToken: async ({ email, accessToken, pgdb }) => {
    const existingPayloads = (await pgdb.public.tokens.find(
      {
        type: Type,
        email,
        'expireAction !=': null,
        'sessionId !=': null
      }
    ))
      .map(token => token.payload)

    if (existingPayloads.length >= MAX_VALID_TOKENS) {
      console.error('Unable to generate a new token: Found too many valid tokens.')
      throw new TokensExceededError({ email, MAX_VALID_TOKENS })
    }

    const expiresAt = new Date(new Date().getTime() + TTL)
    return { payload: accessToken, expiresAt }
  },
  startChallenge: async () => {}, // accessToken is generated and validated elsewhere
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
      'expiresAt >=': new Date()
    })

    return token && token.id
  }
}
