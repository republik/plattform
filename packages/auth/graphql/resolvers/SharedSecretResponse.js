const ISSUER = 'Republik'

// https://github.com/google/google-authenticator/wiki/Key-Uri-Format
const buildOTPUrl = (email, code) =>
  `otpauth://totp/${ISSUER}:${email}?secret=${code}&issuer=${ISSUER}`

const Response = {
  otpAuthUrl ({ secret }, args, { pgdb, user }) {
    return buildOTPUrl(user.email, secret)
  },
  svg ({ secret }, args, { pgdb, user }) {
    const { errorCorrectionLevel } = args
    const url = buildOTPUrl(user.email, secret)
    const qr = require('qr-image')
    return qr.imageSync(url, {
      ec_level: errorCorrectionLevel,
      type: 'svg'
    })
  }
}

module.exports = Response
