const Roles = require('../../lib/Roles')
const userAccessRoles = ['admin', 'supporter']
const { findAllUserSessions } = require('../../lib/Sessions')

module.exports = {
  email (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, [...userAccessRoles, 'editor'])) {
      return user.email
    }
    return null
  },
  async sessions (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, userAccessRoles)) {
      return findAllUserSessions({ pgdb, userId: user.id })
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
  },
  createdAt (user, args, { user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, userAccessRoles)
    return user._raw.createdAt
  },
  updatedAt (user, args, { user: me }) {
    return user._raw.updatedAt
  }
}
