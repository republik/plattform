const querystring = require('querystring')
const { v4: uuid } = require('uuid')

const { app } = require('@orbiting/backend-modules-push-notifications/lib')
const { encode } = require('@orbiting/backend-modules-base64u')

const t = require('../t')
const { newAuthError } = require('../AuthError')

const TokensExceededError = newAuthError(
  'app-challenge-tokens-exceeded',
  'api/auth/app/tokensExceeded',
)
const UserMissingError = newAuthError(
  'app-challenge-user-missing',
  'api/users/404',
)
const AppTokenRequiresMeError = newAuthError(
  'app-token-requires-me',
  'api/signIn/app/requiresMe',
)

const { FRONTEND_BASE_URL, DEFAULT_MAIL_FROM_ADDRESS } = process.env

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const MAX_VALID_TOKENS = 5
const TTL = 1000 * 60 * 10 // 10 minutes
const Type = 'APP'

const getNotification = ({ email, token, context }) => {
  const verificationUrl =
    `${FRONTEND_BASE_URL}/mitteilung?` +
    querystring.stringify({
      context: context || token.context,
      type: 'token-authorization',
      email: encode(email),
      token: token.payload,
      tokenType: Type,
    })

  return {
    title: t('api/signin/app/title'),
    body: t('api/signin/app/body'),
    url: verificationUrl,
    type: 'authorization',
    ttl: TTL,
    expiresAt: token.expiresAt,
    priority: 'high',
  }
}

module.exports = {
  Type,
  generateNewToken: async ({ email, pgdb }) => {
    const tokenCount = await pgdb.public.tokens.count({
      type: Type,
      email,
      'expiresAt >=': new Date(),
    })

    if (tokenCount >= MAX_VALID_TOKENS) {
      console.error(
        'Unable to generate a new token: Found too many valid tokens.',
      )
      throw new TokensExceededError({ email, MAX_VALID_TOKENS })
    }

    return { payload: uuid(), expiresAt: new Date(new Date().getTime() + TTL) }
  },
  startChallenge: async ({ email, context, token, user, pgdb }) => {
    if (!user) {
      throw new UserMissingError({ email })
    }

    // send notice mail if first time
    const hasAppTokens = await pgdb.public.tokens.findFirst({
      email,
      type: Type,
      'payload !=': token.payload,
    })
    if (!hasAppTokens) {
      sendMailTemplate(
        {
          to: email,
          fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
          subject: t('api/signin/mail/appNotice/subject'),
          templateName: 'signin_app_notice',
        },
        { pgdb },
      )
    }

    return app.publish([user.id], getNotification({ context, email, token }), {
      pgdb,
    })
  },
  validateChallenge: async ({ pgdb, user, me }, { payload }) => {
    // app tokens must only be validated if the request is
    // authorized by the user herself.
    if (!me || !user || me.id !== user.id) {
      throw new AppTokenRequiresMeError()
    }
    const foundToken = await pgdb.public.tokens.findOne({
      type: Type,
      payload,
    })
    return foundToken.id
  },
  getNotification,
}
