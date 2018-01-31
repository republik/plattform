// const Roles = require('../../lib/Roles')
// const userAccessRoles = ['admin', 'supporter']
// const { findAllUserSessions } = require('../../lib/Sessions')
const ISSUER = 'Republik'

// https://github.com/google/google-authenticator/wiki/Key-Uri-Format
const buildOTPUrl = (email, code) =>
  `otpauth://totp/${ISSUER}:${email}?secret=${code}&issuer=${ISSUER}`

const Response = {
  otpAuthUrl ({ rawCode }, args, { pgdb, user }) {
    return buildOTPUrl(user.email, rawCode)
  },
  svg ({ rawCode }, args, { pgdb, user }) {
    const { ecLevel } = args
    const url = buildOTPUrl(user.email, rawCode)
    const qr = require('qr-image')
    return qr.imageSync(url, {
      ec_level: ecLevel,
      type: 'svg'
    })
  }
}

module.exports = Response
