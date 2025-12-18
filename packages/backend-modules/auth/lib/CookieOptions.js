function getCookieOptions() {
  const DEV = process.env.NODE_ENV
    ? process.env.NODE_ENV !== 'production'
    : true

  return {
    domain: process.env.COOKIE_DOMAIN ?? undefined,
    httpOnly: true,
    sameSite: !DEV && 'none',
    secure: !DEV,
  }
}

const CookieExpirationTimeInMS = {
  DEFAULT_MAX_AGE: 60000 * 60 * 24 * 365, // 1 year
  SHORT_MAX_AGE: 60000 * 60 * 24 * 7, // 1 week
}

const COOKIE_NAME = process.env.COOKIE_NAME || 'connect.sid'

module.exports = {
  COOKIE_NAME,
  getCookieOptions,
  CookieExpirationTimeInMS,
}
