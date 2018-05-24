const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { resolveUser } = require('../../../lib/Users')
const { clearAllUserSessions, destroySession } = require('../../../lib/Sessions')
const userAccessRoles = ['admin', 'supporter']

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId
  } = args

  const user = await resolveUser({ userId: foreignUserId || me.id, pgdb })

  let isSessionsCleared = false
  if (me.id === user.id) {
    // current user targeted, so we
    // destroy the current session safely via express
    if (await destroySession(req)) isSessionsCleared = true
  }
  if (Roles.userIsMeOrInRoles(user, me, userAccessRoles)) {
    if (await clearAllUserSessions({ pgdb, userId: user.id })) {
      isSessionsCleared = true
    }
  }
  return isSessionsCleared
}
