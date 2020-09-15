const { Roles } = require('@orbiting/backend-modules-auth')

const candidaciesLib = require('../../lib/Candidacy')

module.exports = {
  candidacies: async (user, args, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return []
    }

    return candidaciesLib.findByUser(user._raw, pgdb)
  },
}
