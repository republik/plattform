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
  updatedAt (user) {
    return user._raw.updatedAt
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
    Roles.ensureUserIsMeOrInRoles(user, me, userAccessRoles)
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
  }
}
