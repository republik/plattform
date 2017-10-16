module.exports = (req, t) => {
  if (!req.user) {
    throw new Error(t('api/signIn'))
  }
}
