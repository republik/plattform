const grantsLib = require('../../lib/grants')

const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  grants: async (campaign, { withRevoked, withInvalidated }, { pgdb, user }) => {
    const granter = campaign._user
      ? campaign._user
      : user // Use "me" user ID

    if (Roles.userIsInRoles(user, ['admin', 'supporter'])) {
      return grantsLib.findByGranter(
        granter,
        campaign,
        withRevoked,
        withInvalidated,
        pgdb
      )
    }

    return grantsLib.findByGranter(granter, campaign, false, false, pgdb)
  }
}
