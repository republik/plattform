const { destroySession } = require('../../../lib/Sessions')

module.exports = async (_, args, { req }) => {
  if (!req.session) return true
  await destroySession(req)
  // TODO: get the value from auth.js
  // Need to access response object to clear JWT
  // res.clearCookie('republik-token')

  return true
}
