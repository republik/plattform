const { destroySession } = require('../../../lib/Sessions')

module.exports = async (_, args, { req, res }) => {
  if (!req.session) return true
  await destroySession(req, res)
  return true
}
