const crypto = require('crypto')

module.exports = (plainId) => {
  const hash = crypto
    .createHash('sha1')
    .update(plainId)
    .digest('hex')
  return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12}).*/, '$1-$2-$3-$4-$5')
}
