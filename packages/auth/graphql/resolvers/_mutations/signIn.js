const { signIn } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req }) => {
  const {
    email,
    context,
    consents,
    tokenType,
    accessToken
  } = args

  return signIn(email, context, pgdb, req, consents, tokenType, accessToken)
}
