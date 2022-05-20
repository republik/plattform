const { getCookieOptions } = require('../CookieOptions')

function CookieCleanMiddleware(cookieName) {
  return (req, res, next) => {
    if (!req.user && req.cookies[cookieName]) {
      res.clearCookie(
        process.env.COOKIE_NAME ?? 'connect.sid',
        getCookieOptions(),
      )
    }
  }
}

exports.CookieCleanMiddleware = CookieCleanMiddleware
