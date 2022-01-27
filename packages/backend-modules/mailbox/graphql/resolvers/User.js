const { Roles } = require('@orbiting/backend-modules-auth')

const { getConnection } = require('../../lib/search')

module.exports = {
  async mailbox(user, args, { elastic, pgdb, user: me }) {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter'])) {
      return null
    }

    return getConnection(user, args, { elastic, pgdb })
  },
}
