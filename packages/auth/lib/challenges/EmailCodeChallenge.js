const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const { newAuthError } = require('../AuthError')
const t = require('../t')

const TokensExceededError = newAuthError('email-code-challenge-tokens-exceeded', 'api/auth/emailCode/tokensExceeded')
const CollisionError = newAuthError('email-code-challenge-collision', 'api/auth/emailCode/collison')

const CODE_LENGTH = 6
const MAX_VALID_TOKENS = 5
const TTL = 1000 * 60 * 60 // 60 minutes
const Type = 'EMAIL_CODE'

const { DEFAULT_MAIL_FROM_ADDRESS } = process.env

module.exports = {
  Type,
  generateNewToken: async ({ email, pgdb }) => {
    const existingPayloads = (await pgdb.public.tokens.find(
      {
        type: Type,
        email,
        'expiresAt >=': new Date()
      }
    ))
      .map(token => token.payload)

    if (existingPayloads.length >= MAX_VALID_TOKENS) {
      console.error('Unable to generate a new token: Found too many valid tokens.')
      throw new TokensExceededError({ email, MAX_VALID_TOKENS })
    }

    let attempts = 10 ** CODE_LENGTH
    let payload = null

    do {
      if (attempts-- < 0) {
        console.error('Unable to generate a new token: Attempts to generate payload exceeded.')
        throw new CollisionError({ email, attempts })
      }

      payload = `${Math.round(Math.random() * (10 ** CODE_LENGTH))}`
        .slice(0, CODE_LENGTH)
        .padStart(CODE_LENGTH, 0)
    } while (existingPayloads.includes(payload))

    const expiresAt = new Date(new Date().getTime() + TTL)
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, token, pgdb }) => {
    return sendMailTemplate({
      to: email,
      fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/signin/EMAIL_CODE/mail/subject', { code: token.payload }),
      templateName: 'signin_code',
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        { name: 'code',
          content: token.payload
        }
      ]
    }, { pgdb })
  },
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
