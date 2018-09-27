const { Roles } = require('@orbiting/backend-modules-auth')

const candidaciesLib = require('../../lib/candidacies')

module.exports = {
  candidacies: async (user, args, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(
      user, me, ['admin', 'supporter', 'associcate']
    )) {
      return []
    }

    return candidaciesLib.findByUser(user._raw, pgdb)
  }
}
