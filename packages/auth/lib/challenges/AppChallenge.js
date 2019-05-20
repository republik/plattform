const querystring = require('querystring')
const uuid = require('uuid/v4')
const t = require('../t')

const { newAuthError } = require('../AuthError')
const { app } = require('@orbiting/backend-modules-notifications/lib')
const { encode } = require('@orbiting/backend-modules-base64u')

const UserMissingError = newAuthError('app-challenge-user-missing', 'api/users/404')
const AppTokenRequiresMeError = newAuthError('app-token-requires-me', 'api/signIn/app/requiresMe')

const {
  FRONTEND_BASE_URL,
  DEFAULT_MAIL_FROM_ADDRESS
} = process.env

const {
  sendMailTemplate
} = require('@orbiting/backend-modules-mail')

const MIN_IN_MS = 1000 * 60
const TTL = 10 * MIN_IN_MS
const Type = 'APP'

const getNotification = ({ email, token, context }) => {
  const verificationUrl =
    `${FRONTEND_BASE_URL}/mitteilung?` +
    querystring.stringify({
      context: context || token.context,
      type: 'token-authorization',
      email: encode(email),
      token: token.payload,
      tokenType: Type
    })

  return {
    title: t('api/signin/app/title'),
    body: t('api/signin/app/body'),
    url: verificationUrl,
    type: 'authorization',
    ttl: TTL,
    expiresAt: token.expiresAt,
    priority: 'high'
  }
}

module.exports = {
  Type,
  generateNewToken: async ({ pgdb, session }) => {
    const payload = uuid()
    const expiresAt = new Date(new Date().getTime() + TTL)
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, context, token, user, pgdb }) => {
    if (!user) {
      throw new UserMissingError({ email })
    }

    // send notice mail if first time
    const hasAppTokens = await pgdb.public.tokens.findFirst({
      email,
      type: Type,
      'payload !=': token.payload
    })
    if (!hasAppTokens) {
      sendMailTemplate({
        to: email,
        fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
        subject: t('api/signin/mail/appNotice/subject'),
        templateName: 'signin_app_notice'
      }, { pgdb })
    }

    return app.publish(
      [user.id],
      getNotification({ context, email, token }),
      { pgdb }
    )
  },
  validateChallenge: async ({ pgdb, user, me }, { payload }) => {
    // app tokens must only be validated if the request is
    // authorized by the user herself.
    if (!me || !user || me.id !== user.id) {
      throw new AppTokenRequiresMeError()
    }
    const foundToken = await pgdb.public.tokens.findOne({
      type: Type,
      payload
    })
    return foundToken.id
  },
  getNotification
}
