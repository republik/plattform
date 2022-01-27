const t = require('./t')

module.exports = (req) => {
  if (!req.user) {
    throw new Error(t('api/signIn'))
  }
}
