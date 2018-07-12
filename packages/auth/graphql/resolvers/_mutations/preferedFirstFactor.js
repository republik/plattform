const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { setPreferedFirstFactor } = require('../../../lib/Users')
const transformUser = require('../../../lib/transformUser')

module.exports = async (_, { tokenType }, { pgdb, req, user: me }) => {
  ensureSignedIn(req)

  return setPreferedFirstFactor(me, tokenType, pgdb)
    .then(transformUser)
}
