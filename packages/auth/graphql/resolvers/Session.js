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
