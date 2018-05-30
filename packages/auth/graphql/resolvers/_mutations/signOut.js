const { destroySession } = require('../../../lib/Sessions')

module.exports = async (_, args, { req }) => {
  if (!req.session) return true

  await destroySession(req)
  return true
}
