const { signIn } = require('../../../lib/Users')

module.exports = async (_, args, context) => {
  const { email, context: signInContext, consents, tokenType, accessToken } = args

  return signIn(email, signInContext, consents, tokenType, accessToken, context)
}
