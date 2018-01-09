const hashSessionId = require('../../lib/hashSessionId')

module.exports = {
  id (session, args) {
    return hashSessionId(session.sid)
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
  city (session, args) {
    const { geo = {} } = session.sess
    return geo.city
  },
  expiresAt (session, args) {
    return session.expire
  },
  cookie (session, args) {
    return JSON.stringify(session.sess.cookie)
  }
}
