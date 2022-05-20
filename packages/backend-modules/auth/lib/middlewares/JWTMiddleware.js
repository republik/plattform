const { getJWTForUser } = require('../jwt')
const { userIsInRoles, specialRoles } = require('../Roles')
const {
  getCookieOptions,
  CookieExpirationTimeInMS,
} = require('../CookieOptions')

function JWTMiddleware({ jwtCookieName }) {
  const cookieOptions = getCookieOptions()

  return (req, res, next) => {
    // In case a session and user object exist on the request set the JWT cookie
    if (req.session && req.user) {
      const token = getJWTForUser(req.user, req.sessionID)
      res.cookie(jwtCookieName, token, {
        maxAge: userIsInRoles(req.user, specialRoles)
          ? CookieExpirationTimeInMS.SHORT_MAX_AGE
          : CookieExpirationTimeInMS.DEFAULT_MAX_AGE,
        ...cookieOptions,
      })
    }

    // In case no session exists on the request, delete the JWT cookie
    if (!req.session || !req.user) {
      res.clearCookie(jwtCookieName, cookieOptions)
    }

    next()
  }
}
exports.JWTMiddleware = JWTMiddleware
