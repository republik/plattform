const Roles = require('../../lib/Roles')

module.exports = {
  email (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant', 'editor'])) {
      return user.email
    }
    return null
  },
  initials (user) {
    return user.name
      .split(' ')
      .map(p => p[0])
      .join('')
  },
  roles (user, args, { user: me }) {
    if (
      Roles.userIsMeOrInRoles(user, me, ['admin'])
    ) {
      return user.roles
    }
    return []
  }
}
