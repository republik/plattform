const querystring = require('querystring')
const uuid = require('uuid/v4')
const t = require('../t')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { encode } = require('@orbiting/backend-modules-base64u')

const {
  FRONTEND_BASE_URL,
  DEFAULT_MAIL_FROM_ADDRESS
} = process.env

const MIN_IN_MS = 1000 * 60
const HOUR_IN_MS = MIN_IN_MS * 60
const TTL = HOUR_IN_MS
const Type = 'EMAIL_TOKEN'

module.exports = {
  Type,
  generateNewToken: async ({ pgdb, session }) => {
    const payload = uuid()
    const expiresAt = new Date(new Date().getTime() + TTL)
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, context, token, country, phrase, pgdb }) => {
    const geoString = (country === 'Schweiz')
      ? `der Schweiz`
      : country

    const verificationUrl =
      `${FRONTEND_BASE_URL}/mitteilung?` +
      querystring.stringify({
        context,
        type: 'token-authorization',
        email: encode(email),
        token: token.payload,
        tokenType: Type
      })

    return sendMailTemplate({
      to: email,
      fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/signin/mail/subject', { phrase }),
      templateName: 'signin',
      globalMergeVars: [
        { name: 'LOCATION',
          content: geoString
        },
        { name: 'SECRET_WORDS',
          content: phrase
        },
        { name: 'LOGIN_LINK',
          content: verificationUrl
        }
      ]
    }, { pgdb })
  },
  validateChallenge: async ({ pgdb, user }, { payload }) => {
    const foundToken = await pgdb.public.tokens.findOne({
      type: Type,
      payload
    })
    return foundToken.id
  }
}
