const { sessionByToken } = require('../../../lib/Sessions')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  const { email, token } = args

  return sessionByToken({ pgdb, token, email })
}
