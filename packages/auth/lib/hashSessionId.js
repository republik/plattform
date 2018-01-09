module.exports = (id) => {
  const crypto = require('crypto')
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(id)
    .digest('hex')
}
