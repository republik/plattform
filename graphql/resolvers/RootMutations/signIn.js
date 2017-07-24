const signIn = require('../../../lib/signIn')

module.exports = async (_, args, {pgdb, req}) => {
  return signIn(args.email, pgdb, req)
}
