const jwt = require('jsonwebtoken')
const { userIsInRoles, specialRoles } = require('./Roles')

// TODO: copy of code in express/auth.js move these vars to constants-file
const DEFAULT_MAX_AGE_IN_MS = 60000 * 60 * 24 * 365 // 1 year
const SHORT_MAX_AGE_IN_MS = 60000 * 60 * 24 * 7 // 1 week

let privateKey = null

function getJWTForUser(user, sessionId) {
  if (!privateKey && process.env.JWT_PRIVATE_KEY) {
    if (!process.env.JWT_PRIVATE_KEY) {
      throw new Error('env variableJWT_PRIVATE_KEY is missing')
    }

    privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString()
  }

  const expiresIn = userIsInRoles(user, specialRoles)
    ? DEFAULT_MAX_AGE_IN_MS
    : SHORT_MAX_AGE_IN_MS

  const userToken = jwt.sign(
    {
      email: user.email,
      roles: user.roles,
    },
    {
      key: privateKey,
      passphrase: 'secret',
    },
    {
      jwtid: sessionId,
      algorithm: 'RS256',
      issuer: process.env.JWT_ISSUER,
      expiresIn: (Date.now() + expiresIn) * 1000, // expiresIn is in seconds
    },
  )

  return userToken
}

exports.getJWTForUser = getJWTForUser
