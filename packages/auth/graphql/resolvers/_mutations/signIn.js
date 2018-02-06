const { signIn } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req }) => {
  const {
    email,
    context
  } = args

  return signIn(email, context, pgdb, req)
}
