const { getJWTForUser } = require('../jwt')
const { userIsInRoles, specialRoles } = require('../Roles')
const {
  getCookieOptions,
  CookieExpirationTimeInMS,
} = require('../CookieOptions')

function checkIfCookieIsPresent(req, cookieName) {
  return req.headers?.cookie?.includes(`${cookieName}=`)
}

function JWTMiddleware({ sessionCookieName, jwtCookieName }) {
  const cookieOptions = getCookieOptions()

  return (req, res, next) => {
    console.log({
      sessionPresent: checkIfCookieIsPresent(req, sessionCookieName),
      jwtPresent: checkIfCookieIsPresent(req, jwtCookieName),
      cookies: req.headers?.cookie,
    })
    if (req.user || checkIfCookieIsPresent(req, sessionCookieName)) {
      const token = getJWTForUser(req.user, req.sessionID)
      res.cookie(jwtCookieName, token, {
        maxAge: userIsInRoles(req.user, specialRoles)
          ? CookieExpirationTimeInMS.SHORT_MAX_AGE
          : CookieExpirationTimeInMS.DEFAULT_MAX_AGE,
        ...cookieOptions,
      })
    } else if (checkIfCookieIsPresent(req, jwtCookieName)) {
      // In case no session cookie exists on the request, delete the JWT cookie
      res.clearCookie(jwtCookieName, cookieOptions)
    }

    next()
  }
}
exports.JWTMiddleware = JWTMiddleware
