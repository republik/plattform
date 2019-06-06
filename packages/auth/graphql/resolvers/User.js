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
  async sessions (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
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
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return user._raw.createdAt
  },
  updatedAt (user) {
    return user._raw.updatedAt
  },
  deletedAt (user, args, { user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return user._raw.deletedAt
  },
  enabledSecondFactors (user, args, { user: me }) {
    if (
      Roles.userIsMeOrInRoles(user, me, ['supporter'])
    ) {
      return user._raw.enabledSecondFactors
    }
    return []
  },
  async eventLog (user, args, { pgdb, user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return pgdb.query(`
      SELECT
        e.*,
        to_json(s.*) as "activeSession"
      FROM
        "eventLog" e
      LEFT JOIN
        sessions s
          ON e."newData" #>> '{sid}' = s.sid
      WHERE
        e."newData" #>> '{sess,email}' = :email OR
        e."oldData" #>> '{sess,email}' = :email OR
        e."newData" #>> '{sess,passport,user}' = :userId OR
        e."oldData" #>> '{sess,passport,user}' = :userId
      ORDER BY
        e."createdAt" DESC
    `, {
      email: user.email,
      userId: user.userId
    })
      .then(result => result
        .map(e => ({
          ...e,
          archivedSession: e.newData || e.oldData
        }))
      )
  },
  async enabledFirstFactors (user, args, { pgdb, user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return enabledFirstFactors(user._raw.email, pgdb)
  },
  preferredFirstFactor (user, args, { user: me }) {
    Roles.ensureUserIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)
    return user._raw.preferredFirstFactor
  },
  isUserOfCurrentSession: (user, args, { user: me }) =>
    !!(me && user.id === me.id),

  accessToken: (user, { scope }, { user: me }) => {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
      return AccessToken.generateForUser(user, scope)
    }
  },
  hasConsentedTo: (user, { name }, { pgdb, user: me }) => {
    if (Roles.userIsMeOrInRoles(user, me, DEFAULT_USER_ACCESS_ROLES)) {
      return Consents.statusForPolicyForUser({
        userId: user.id,
        policy: name,
        pgdb
      })
    }
  }
}
