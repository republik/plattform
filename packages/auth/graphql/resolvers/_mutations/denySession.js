const {
  denySession } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req, signInHooks }) => {
  const {
    token,
    email
  } = args

  const user = await denySession({
    pgdb,
    token,
    email
  })

  return !!user
}
