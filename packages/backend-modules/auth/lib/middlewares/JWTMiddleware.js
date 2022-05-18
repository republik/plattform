const { getJWTForUser } = require('../jwt')
const { userIsInRoles, specialRoles } = require('../Roles')

function JWTMiddleware({
  maxAge,
  maxAgeSpecialRoles,
  dev,
  domain,
  jwtCookieName,
}) {
  return (req, res, next) => {
    // In case a session and user object exist on the request set the JWT cookie
    if (req.session && req.user) {
      const token = getJWTForUser(req.user, req.sessionID)
      res.cookie(jwtCookieName, token, {
        maxAge: userIsInRoles(req.user, specialRoles)
          ? maxAgeSpecialRoles
          : maxAge,
        domain,
        sameSite: !dev && 'none',
        secure: !dev,
        httpOnly: true,
      })
    }

    // In case no session exists on the request, delete the JWT cookie
    if (!req.session || !req.user) {
      const DEV = process.env.NODE_ENV
        ? process.env.NODE_ENV !== 'production'
        : true
      res.clearCookie(jwtCookieName, {
        domain: process.env.COOKIE_DOMAIN ?? undefined,
        httpOnly: true,
        sameSite: !DEV && 'none',
        secure: !DEV,
      })
    }

    next()
  }
}
exports.JWTMiddleware = JWTMiddleware
