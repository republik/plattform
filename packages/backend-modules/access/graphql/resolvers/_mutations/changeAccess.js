const debug = require('debug')('access:mutation:terminateAccess')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const {
  revoke: revokeAccess,
  terminate: terminateAccess,
} = require('../../../lib/grants')

module.exports = async (
  _,
  { id, revoke, terminate },
  { req, user, pgdb, t, mail },
) => {
  ensureSignedIn(req)

  debug('begin', { id, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    if (revoke) {
      await revokeAccess(id, user, t, transaction)
    }
    if (terminate) {
      await terminateAccess(id, user, t, transaction, mail)
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
