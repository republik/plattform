const { authorizeSession } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req, user: me, signInHooks }) => {
  const {
    email,
    tokens = [],
    consents,
    requiredFields
  } = args

  const user = await authorizeSession({
    pgdb,
    tokens,
    email,
    signInHooks,
    consents,
    requiredFields,
    req,
    me
  })

  return !!user
}
