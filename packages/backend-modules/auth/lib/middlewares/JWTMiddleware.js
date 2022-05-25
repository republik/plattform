const { getJWTForUser } = require('../jwt')
const { getCookieOptions } = require('../CookieOptions')

function checkIfCookieIsPresent(req, cookieName) {
  return req.headers?.cookie?.includes(`${cookieName}=`)
}

function JWTMiddleware({ sessionCookieName, jwtCookieName }) {
  const cookieOptions = getCookieOptions()

  return (req, res, next) => {
    const { user, sessionID } = req

    if (user || checkIfCookieIsPresent(req, sessionCookieName)) {
      const { webTokenString, payload } = getJWTForUser(user, sessionID)
      const { expiresIn: maxAge } = payload

      res.cookie(jwtCookieName, webTokenString, {
        maxAge,
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
