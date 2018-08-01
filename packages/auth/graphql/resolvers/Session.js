const { flag, code } = require('country-emoji')
const useragent = require('../../lib/useragent')

module.exports = {
  id (session) {
    return session.id
  },
  ipAddress (session) {
    return session.sess.ip
  },
  userAgent (session) {
    return useragent.detect(session.sess.ua)
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
  },
  emojis (session) {
    return session.sess.emojis
  }
}
