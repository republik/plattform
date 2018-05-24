const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { clearUserSession, destroySession } = require('../../../lib/Sessions')
const { resolveUser } = require('../../../lib/Users')
const userAccessRoles = ['admin', 'supporter']

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId,
    sessionId
  } = args

  const user = await resolveUser({ userId: foreignUserId || me.id, pgdb })

  const session = pgdb.public.sessions.findOne({ sid: req.sessionID, email: user.email })
  if (session.id === sessionId) {
    // current session, normal logout
    await destroySession(req)
    return true
  }
  if (Roles.userIsMeOrInRoles(user, me, userAccessRoles)) {
    return clearUserSession({ pgdb, userId: user.id, sessionId })
  }
  return false
}
