const ensureSignedIn = require('../../../lib/ensureSignedIn')
const checkUsername = require('../../../lib/checkUsername')

module.exports = (_, { username }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  return checkUsername(username, me, pgdb)
}
