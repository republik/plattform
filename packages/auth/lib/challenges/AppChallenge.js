const querystring = require('querystring')
const uuid = require('uuid/v4')
const t = require('../t')

const { newAuthError } = require('../AuthError')
const { app } = require('@orbiting/backend-modules-notifications/lib')
const { encode } = require('@orbiting/backend-modules-base64u')

const UserMissingError = newAuthError('app-challenge-user-missing', 'api/users/404')

const {
  FRONTEND_BASE_URL
} = process.env

const MIN_IN_MS = 1000 * 60
const Type = 'APP'

module.exports = {
  Type,
  generateNewToken: async ({ pgdb, session }) => {
    const payload = uuid()
    const expiresAt = new Date(new Date().getTime() + 10 * MIN_IN_MS)
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, context, token, user, pgdb }) => {
    if (!user) {
      throw new UserMissingError({ email })
    }

    const verificationUrl =
      `${FRONTEND_BASE_URL}/mitteilung?` +
      querystring.stringify({
        context,
        type: 'token-authorization',
        email: encode(email),
        token: token.payload,
        tokenType: Type
      })

    return app.publish({
      userIds: [user.id],
      title: t('api/signin/app/title'),
      body: t('api/signin/app/body'),
      url: verificationUrl,
      type: 'discussion'// 'signIn'
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
