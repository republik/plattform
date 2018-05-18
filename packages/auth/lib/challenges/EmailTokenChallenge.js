const querystring = require('querystring')
const checkEnv = require('check-env')
const uuid = require('uuid/v4')
const t = require('../t')

const {
  sendMail,
  sendMailTemplate
} = require('@orbiting/backend-modules-mail')
const { encode } = require('@orbiting/backend-modules-base64u')

checkEnv([
  'AUTH_MAIL_FROM_ADDRESS'
])

const {
  AUTH_MAIL_FROM_ADDRESS,
  FRONTEND_BASE_URL,
  AUTH_MAIL_TEMPLATE_NAME,
  AUTH_MAIL_SUBJECT
} = process.env

const MIN_IN_MS = 1000 * 60
const HOUR_IN_MS = MIN_IN_MS * 60
const DAY_IN_MS = HOUR_IN_MS * 24
const Type = 'EMAIL_TOKEN'

module.exports = {
  Type,
  generateNewToken: async ({ pgdb, session }) => {
    const payload = uuid()
    const expiresAt = new Date(new Date().getTime() + DAY_IN_MS)
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, context, token, country, phrase }) => {
    const geoString = (country === 'Schweiz')
      ? `der Schweiz`
      : country

    const verificationUrl =
      `${FRONTEND_BASE_URL}/mitteilung?` +
      querystring.stringify({
        type: 'token-authorization',
        email: encode(email),
        context,
        token: token.payload
      })

    if (AUTH_MAIL_TEMPLATE_NAME) {
      return sendMailTemplate({
        to: email,
        fromEmail: AUTH_MAIL_FROM_ADDRESS,
        subject: AUTH_MAIL_SUBJECT || t('api/signin/mail/subject'),
        templateName: AUTH_MAIL_TEMPLATE_NAME,
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
      })
    }

    return sendMail({
      to: email,
      fromEmail: AUTH_MAIL_FROM_ADDRESS,
      subject: AUTH_MAIL_SUBJECT || t('api/signin/mail/subject'),
      text: `
  Hi!
  ${geoString ? '\nLogin attempt from ' + geoString + '\n' : ''}
  Verify that the provided security code matches *${phrase}* before proceeding.

  Then please follow this link to signin.
  ${verificationUrl}
  `
    })
  },
  validateChallenge: async ({ pgdb, user }, { payload }) => {
    const foundToken = await pgdb.public.tokens.findOne({
      type: Type,
      payload
    })
    return foundToken.id
  }
}
