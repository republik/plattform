const t = require('../../../lib/t')
const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { clearUserSession, destroySession, DestroySessionError } = require('../../../lib/Sessions')
const { resolveUser } = require('../../../lib/Users')
const userAccessRoles = ['admin', 'supporter']

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId,
    sessionId
  } = args

  const user = await resolveUser({ slug: foreignUserId, pgdb, fallback: me })

  try {
    const session = pgdb.public.sessions.findOne({ sid: req.sessionID, email: user.email })
    if (session.id === sessionId) {
      // current session, normal logout
      await destroySession(req)
      return true
    }
    if (Roles.userIsMeOrInRoles(user, me, userAccessRoles)) {
      return await clearUserSession({ pgdb, userId: user.id, sessionId })
    }
    return false
  } catch (e) {
    if (e instanceof DestroySessionError) {
      console.error('clearSession: exception %O', { req: req._log(), userId: user.id, sessionId, ...e.meta })
    } else {
      const util = require('util')
      console.error('clearSession: exception', util.inspect({ req: req._log(), userId: user.id, sessionId, e }, {depth: null}))
    }
    throw new Error(t('api/auth/errorDestroyingSession'))
  }
}
