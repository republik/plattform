module.exports = async (_, args, { req, t }) => {
  if (!req.session) {
    return true
  }

  await new Promise((resolve, reject) => {
    req.session.destroy(error => {
      if (error) {
        console.error('auth: error destroying session', { req, error })
        return reject((t('api/auth/errorDestroyingSession')))
      }
      return resolve()
    })
  })

  return true
}
