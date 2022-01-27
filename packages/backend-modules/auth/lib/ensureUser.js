const t = require('./t')

module.exports = (user) => {
  if (!user || !user.id) {
    throw new Error(t('api/signIn'))
  }
}
