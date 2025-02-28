const { getJWTForUser, getJWTForIP } = require('../jwt')
const {
  getCookieOptions,
  COOKIE_NAME,
  JWT_COOKIE_NAME,
  IP_ALLOWLIST_COOKIE_NAME,
} = require('../CookieOptions')

function checkIfCookieIsPresent(req, cookieName) {
  return req.headers?.cookie?.includes(`${cookieName}=`)
}

function JWTMiddleware() {
  const cookieOptions = getCookieOptions()

  return (req, res, next) => {
    const { user, sessionID, headers, socket } = req
    const clientIP = headers['x-forwarded-for'] || socket.remoteAddress

    // Set JWT Cookie for allowed IP
    const isAllowedIP =
      clientIP &&
      process.env.IP_ALLOWLIST &&
      process.env.IP_ALLOWLIST.includes(clientIP)

    if (isAllowedIP) {
      const { webTokenString, payload } = getJWTForIP(clientIP)
      const { expiresIn: maxAge } = payload

      res.cookie(IP_ALLOWLIST_COOKIE_NAME, webTokenString, {
        maxAge,
        ...cookieOptions,
        httpOnly: false,
      })
    } else if (user || checkIfCookieIsPresent(req, COOKIE_NAME)) {
      const { webTokenString, payload } = getJWTForUser(user, sessionID)
      const { expiresIn: maxAge } = payload

      res.cookie(JWT_COOKIE_NAME, webTokenString, {
        maxAge,
        ...cookieOptions,
      })
    } else if (checkIfCookieIsPresent(req, JWT_COOKIE_NAME)) {
      // In case no session cookie exists on the request, delete the JWT cookie
      res.clearCookie(JWT_COOKIE_NAME, cookieOptions)
    }

    next()
  }
}
exports.JWTMiddleware = JWTMiddleware
