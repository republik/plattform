const jwt = require('jsonwebtoken')

const { userIsInRoles, specialRoles, exposableRoles } = require('./Roles')
const { CookieExpirationTimeInMS } = require('./CookieOptions')

const privateKey =
  process.env.JWT_PRIVATE_KEY &&
  Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString()

const getJWTForUser = (user, sessionId) => {
  if (!privateKey) {
    throw new Error('env variable JWT_PRIVATE_KEY is missing')
  }

  if (user && !sessionId) {
    throw new Error('JWT arg sessionId is missing')
  }

  const roles = user?.roles?.filter((role) => exposableRoles.includes(role))
  const expiresIn = userIsInRoles(user, specialRoles)
    ? CookieExpirationTimeInMS.SHORT_MAX_AGE
    : CookieExpirationTimeInMS.DEFAULT_MAX_AGE
  const issuer = process.env.JWT_ISSUER
  const jwtid = sessionId

  const webTokenString = jwt.sign({ roles }, privateKey, {
    algorithm: 'ES256',
    expiresIn: `${expiresIn}ms`,
    issuer,
    jwtid,
  })

  return { webTokenString, payload: { roles, expiresIn, issuer, jwtid } }
}

const getJWTForIP = (ip) => {
  if (!privateKey) {
    throw new Error('env variable JWT_PRIVATE_KEY is missing')
  }
  if (!ip) {
    throw new Error('IP address missing')
  }
  const issuer = process.env.JWT_ISSUER
  const expiresIn = CookieExpirationTimeInMS.DEFAULT_MAX_AGE

  const webTokenString = jwt.sign({ ip }, privateKey, {
    algorithm: 'ES256',
    expiresIn: `${expiresIn}ms`,
    issuer,
  })

  return { webTokenString, payload: { ip, expiresIn, issuer } }
}

exports.getJWTForUser = getJWTForUser
exports.getJWTForIP = getJWTForIP
