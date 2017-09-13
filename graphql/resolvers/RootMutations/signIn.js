const signIn = require('../../../lib/signIn')

module.exports = async (_, args, { pgdb, req, t }) => {
  return signIn(args.email, pgdb, req, t)
}
