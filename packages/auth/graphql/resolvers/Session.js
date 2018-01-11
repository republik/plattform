const { flag, code } = require('country-emoji')

module.exports = {
  id (session, args) {
    return session.id
  },
  ipAddress (session, args) {
    return session.sess.ip
  },
  userAgent (session, args) {
    return session.sess.ua
  },
  email (session, args) {
    return session.sess.email
  },
  country (session, args) {
    const { geo = {} } = session.sess
    return geo.country
  },
  countryFlag (session, args) {
    const { geo = {} } = session.sess
    const countryCode = geo.country ? code(geo.country) : null
    return countryCode ? flag(countryCode) : '🏴'
  },
  city (session, args) {
    const { geo = {} } = session.sess
    return geo.city
  },
  expiresAt (session, args) {
    return session.expire
  },
  isCurrent (session, args, { req }) {
    return session.sid === req.sessionID
  }
}
