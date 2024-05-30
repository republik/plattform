const crypto = require('node:crypto')

function genIdempotencyKey(...segments) {
  return crypto
    .createHash('sha256')
    .update(segments.join(':'))
    .digest('base64url')
}

module.exports = {
  genIdempotencyKey,
}
