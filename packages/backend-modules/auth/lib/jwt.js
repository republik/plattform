const jwt = require('jsonwebtoken')
const { userIsInRoles, specialRoles } = require('./Roles')
const { CookieExpirationTimeInMS } = require('./CookieOptions')

let privateKey = null

function getJWTForUser(user, sessionId) {
  if (!privateKey) {
    if (!process.env.JWT_PRIVATE_KEY) {
      throw new Error('env variableJWT_PRIVATE_KEY is missing')
    }

    privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString()
  }

  const expiresIn = userIsInRoles(user, specialRoles)
    ? CookieExpirationTimeInMS.SHORT_MAX_AGE
    : CookieExpirationTimeInMS.DEFAULT_MAX_AGE

  const expiresInSecondsFromNow = Math.round((Date.now() + expiresIn) / 1000)

  const userToken = jwt.sign(
    user
      ? {
          id: user.id,
          roles: user.roles,
        }
      : {
          roles: [],
        },
    {
      key: privateKey,
      passphrase: 'secret',
    },
    {
      jwtid: sessionId,
      algorithm: 'RS256',
      issuer: process.env.JWT_ISSUER,
      expiresIn: expiresInSecondsFromNow,
    },
  )

  return userToken
}

exports.getJWTForUser = getJWTForUser
