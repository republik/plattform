const t = require('../../../lib/t')
const Roles = require('../../../lib/Roles')
const { DestroySessionError } = require('../../../lib/errors')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { clearUserSession, destroySession } = require('../../../lib/Sessions')
const hashSessionId = require('../../../lib/hashSessionId')
const userAccessRoles = ['admin', 'supporter']

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId,
    sessionId
  } = args

  const user = foreignUserId
    ? (await pgdb.public.users.findOne({ id: foreignUserId }))
    : me

  try {
    if ((await hashSessionId(req.sessionID, me.email)) === sessionId) {
      // current session, normal logout
      await destroySession(req)
      return true
    }
    if (Roles.userIsMeOrInRoles(user, me, userAccessRoles)) {
      return await clearUserSession({ pgdb, store: req.sessionStore, userId: user.id, sessionId })
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
