const Roles = require('../../lib/Roles')
const { findAllUserSessions } = require('../../lib/Sessions')
const { enabledFirstFactors } = require('../../lib/Users')
const AccessToken = require('../../lib/AccessToken')
const Consents = require('../../lib/Consents')

const DEFAULT_USER_ACCESS_ROLES = ['admin', 'supporter']
const BASICS_USER_ACCESS_ROLES = [...DEFAULT_USER_ACCESS_ROLES, 'editor']

const expose = (roles, accessor) => (user, args, { user: me }) => {
  if (Roles.userIsMeOrInRoles(user, me, roles)) {
    return user[accessor]
  }
}
module.exports = {
  email: expose(BASICS_USER_ACCESS_ROLES, 'email'),
  name: expose(BASICS_USER_ACCESS_ROLES, 'name'),
  firstName: expose(BASICS_USER_ACCESS_ROLES, 'firstName'),
  lastName: expose(BASICS_USER_ACCESS_ROLES, 'lastName'),
  username: expose(BASICS_USER_ACCESS_ROLES, 'username'),
  async sessions(user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
      return findAllUserSessions({ pgdb, userId: user.id })
    }
    return null
  },
  initials(user) {
    return user.name
      .split(' ')
      .map((p) => p[0])
      .join('')
  },
  roles(user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
      return user.roles.filter((role) => Roles.exposableRoles.includes(role))
    }
    return []
  },
  createdAt(user, args, { user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return user._raw.createdAt
  },
  updatedAt(user) {
    return user._raw.updatedAt
  },
  deletedAt(user, args, { user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return user._raw.deletedAt
  },
  enabledSecondFactors(user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
      return user._raw.enabledSecondFactors
    }
    return []
  },
  async enabledFirstFactors(user, args, { pgdb, user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return enabledFirstFactors(user._raw.email, pgdb)
  },
  preferredFirstFactor(user, args, { user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return user._raw.preferredFirstFactor
  },
  isUserOfCurrentSession: (user, args, { user: me }) =>
    !!(me && user.id === me.id),

  accessToken: (user, { scope }, { user: me }) =>
    AccessToken.generateForUserByUser(
      user,
      scope,
      me,
      DEFAULT_USER_ACCESS_ROLES,
    ),

  hasConsentedTo: (user, { name }, { pgdb, user: me }) => {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
      return Consents.statusForPolicyForUser({
        userId: user.id,
        policy: name,
        pgdb,
      })
    }
  },
}
