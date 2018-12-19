const debug = require('debug')('access:mutation:revokeAccess')

const { revoke } = require('../../../lib/grants')

module.exports = async (_, { id }, { user, pgdb, t, mail }) => {
  debug('begin', { id, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result = await revoke(id, user, t, transaction, mail)
    await transaction.transactionCommit()

    debug('commit', { id, user: user.id })

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { id, user: user.id })

    throw e
  }
}
