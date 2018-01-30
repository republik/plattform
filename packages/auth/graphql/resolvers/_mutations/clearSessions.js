const t = require('../../../lib/t')
const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { resolveUser } = require('../../../lib/Users')
const { clearAllUserSessions, destroySession, DestroySessionError } = require('../../../lib/Sessions')
const userAccessRoles = ['admin', 'supporter']

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId
  } = args

  const user = await resolveUser({ slug: foreignUserId, pgdb, fallback: me })

  try {
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
  } catch (e) {
    if (e instanceof DestroySessionError) {
      console.error('clearSessions: exception %O', { req: req._log(), userId: user.id, ...e.meta })
    } else {
      const util = require('util')
      console.error('clearSessions: exception', util.inspect({ req: req._log(), userId: user.id, e }, {depth: null}))
    }
    throw new Error(t('api/auth/errorDestroyingSession'))
  }
}
