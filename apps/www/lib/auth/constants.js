const COOKIE_NAME = process.env.COOKIE_DOMAIN || 'connect.sid'
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'user-token'

// also used in server/index.js without es module support
module.exports = {
  COOKIE_NAME,
  JWT_COOKIE_NAME,
}
