const { flag, code } = require('country-emoji')
const useragent = require('useragent')

module.exports = {
  id (session, args) {
    return session.id
  },
  ipAddress (session, args) {
    return session.sess.ip
  },
  userAgent (session, args) {
    return session.sess.ua &&
      useragent.parse(session.sess.ua).toString()
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
    const countryCode = geo.countryEN ? code(geo.countryEN) : null
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
  },
  async tokenTypes (session, args, { pgdb }) {
    const tokens = await pgdb.public.tokens.find({
      sessionId: session.id
    })
    return [...new Set(tokens.map(({ type }) => type))]
  }
}
