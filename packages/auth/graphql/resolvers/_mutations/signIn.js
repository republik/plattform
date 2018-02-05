const signIn = require('../../../lib/signIn')

module.exports = async (_, args, { pgdb, req }) => {
  const {
    email,
    context
  } = args
  return signIn(email, context, pgdb, req)
}
