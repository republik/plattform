const debug = require('debug')('access:mutation:terminateAccess')

const { ensureSignedIn, Roles } = require('@orbiting/backend-modules-auth')

const {
  revoke: revokeAccess,
  invalidate: invalidateAccess,
  noFollowup: noFollowupAccess,
} = require('../../../lib/grants')

module.exports = async (
  _,
  { id, revoke, invalidate, noFollowup },
  { req, user, pgdb, t, mail },
) => {
  ensureSignedIn(req)

  if (!Roles.userIsInRoles(user, ['admin', 'supporter'])) {
    throw new Error(t('api/access/terminate/role/error'))
  }

  debug('begin', { id, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    if (revoke) {
      await revokeAccess(id, user, t, transaction)
    }

    if (invalidate) {
      const grant = await pgdb.public.accessGrants.findOne({ id })
      await invalidateAccess(grant, 'admin', t, pgdb, mail)
    }

    if (noFollowup) {
      await noFollowupAccess(id, pgdb)
    }

    await transaction.transactionCommit()

    debug('commit', { id, user: user.id })

    return true
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { id, user: user.id })

    throw e
  }
}
