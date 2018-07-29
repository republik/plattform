const { authorizeSession } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req, user: me, signInHooks }) => {
  const {
    email,
    tokens = [],
    consents
  } = args

  const user = await authorizeSession({
    pgdb,
    tokens,
    email,
    signInHooks,
    consents,
    req,
    me
  })

  return !!user
}
