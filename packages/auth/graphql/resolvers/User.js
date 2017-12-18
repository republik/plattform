const Roles = require('../../lib/Roles')

module.exports = {
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
      return user._data.roles || []
    }
    return []
  }
}
