const {
  denySession } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req, signInHooks }) => {
  const {
    tokenChallenge,
    email
  } = args

  const user = await denySession({
    pgdb,
    tokenChallenge,
    email
  })

  return !!user
}
