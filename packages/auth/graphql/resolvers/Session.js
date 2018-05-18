const { flag, code } = require('country-emoji')
const useragent = require('useragent')

module.exports = {
  id (session) {
    return session.id
  },
  ipAddress (session) {
    return session.sess.ip
  },
  userAgent (session) {
    return session.sess.ua &&
      useragent.parse(session.sess.ua).toString()
  },
  email (session) {
    return session.sess.email
  },
  country (session) {
    const { geo = {} } = session.sess
    return geo.country
  },
  countryFlag (session) {
    const { geo = {} } = session.sess
    const countryCode = geo.countryEN ? code(geo.countryEN) : null
    return countryCode ? flag(countryCode) : '🏴'
  },
  city (session) {
    const { geo = {} } = session.sess
    return geo.city
  },
  expiresAt (session) {
    return session.expire
  },
  isCurrent (session, args, { req }) {
    return session.sid === req.sessionID
  },
  phrase (session) {
    return session.sess.phrase
  }
}
