const querystring = require('querystring')
const { v4: uuid } = require('uuid')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { encode } = require('@orbiting/backend-modules-base64u')

const t = require('../t')
const { newAuthError } = require('../AuthError')

const TokensExceededError = newAuthError(
  'email-token-challenge-tokens-exceeded',
  'api/auth/emailToken/tokensExceeded',
)

const { FRONTEND_BASE_URL, DEFAULT_MAIL_FROM_ADDRESS } = process.env

const MAX_VALID_TOKENS = 5
const TTL = 1000 * 60 * 60 // 60 minutes
const Type = 'EMAIL_TOKEN'

module.exports = {
  Type,
  generateNewToken: async ({ email, pgdb }) => {
    // Find tokens matching Type and email, which have not expired yet.
    const tokenCount = await pgdb.public.tokens.count({
      type: Type,
      email,
      'expiresAt >=': new Date(),
    })

    // Throw an error if there are {MAX_VALID_TOKENS} or more tokens returned,
    // as having more than a certain number of unexpired tokens is an unwarrented
    // auth behaviour.
    if (tokenCount >= MAX_VALID_TOKENS) {
      console.error(
        'Unable to generate a new token: Found too many valid tokens.',
      )
      throw new TokensExceededError({ email, MAX_VALID_TOKENS })
    }

    return { payload: uuid(), expiresAt: new Date(new Date().getTime() + TTL) }
  },
  startChallenge: async ({
    email,
    context,
    token,
    country,
    phrase,
    pgdb,
    locale = 'de',
  }) => {
    const geoString = country === 'Schweiz' ? 'der Schweiz' : country

    const verificationUrl =
      `${FRONTEND_BASE_URL}/${locale}/message?` +
      querystring.stringify({
        context,
        type: 'token-authorization',
        email: encode(email),
        token: token.payload,
        tokenType: Type,
      })

    return sendMailTemplate(
      {
        to: email,
        fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
        subject: t(`api/signin/mail/${locale}/subject`, { phrase }),
        templateName: `${locale}/signin`,
        globalMergeVars: [
          {
            name: 'LOCATION',
            content: geoString,
          },
          {
            name: 'SECRET_WORDS',
            content: phrase,
          },
          {
            name: 'LOGIN_LINK',
            content: verificationUrl,
          },
        ],
      },
      { pgdb },
    )
  },
  validateChallenge: async ({ pgdb }, { payload }) => {
    const foundToken = await pgdb.public.tokens.findOne({
      type: Type,
      payload,
    })
    return foundToken.id
  },
}
