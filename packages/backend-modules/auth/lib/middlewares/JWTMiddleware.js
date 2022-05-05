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
      console.log('JWT destroyed')
      res.clearCookie(jwtCookieName)
      res.clearCookie('connect.sid')
    }

    next()
  }
}
exports.JWTMiddleware = JWTMiddleware
