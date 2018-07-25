const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { setPreferredFirstFactor } = require('../../../lib/Users')
const transformUser = require('../../../lib/transformUser')

module.exports = async (_, { tokenType }, { pgdb, req, user: me }) => {
  ensureSignedIn(req)

  return setPreferredFirstFactor(me, tokenType, pgdb)
    .then(transformUser)
}
