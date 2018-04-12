const { authorizeSession } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req, signInHooks }) => {
  const {
    email,
    tokens = []
  } = args

  const user = await authorizeSession({
    pgdb,
    tokens,
    email,
    signInHooks
  })

  return !!user
}
