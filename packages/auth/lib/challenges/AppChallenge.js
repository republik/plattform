const querystring = require('querystring')
const uuid = require('uuid/v4')
const t = require('../t')

const { newAuthError } = require('../AuthError')
const { app } = require('@orbiting/backend-modules-notifications/lib')
const { encode } = require('@orbiting/backend-modules-base64u')

const UserMissingError = newAuthError('app-challenge-user-missing', 'api/users/404')
const AppTokenRequiresMeError = newAuthError('app-token-requires-me', 'api/signIn/app/requiresMe')

const {
  FRONTEND_BASE_URL
} = process.env

const MIN_IN_MS = 1000 * 60
const TTL = 10 * MIN_IN_MS
const Type = 'APP'

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

    const verificationUrl =
      `${FRONTEND_BASE_URL}/mitteilung?` +
      querystring.stringify({
        context,
        type: 'token-authorization',
        email: encode(email),
        token: token.payload,
        tokenType: Type
      })

    return app.publish(
      [user.id],
      {
        title: t('api/signin/app/title'),
        body: t('api/signin/app/body'),
        url: verificationUrl,
        type: 'discussion', // TODO change to 'authorization'
        ttl: TTL,
        priority: 'high'
      }, {
        pgdb
      }
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
  }
}
