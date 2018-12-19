const debug = require('debug')('access:mutation:claimAccess')

const { claim } = require('../../../lib/grants')

module.exports = async (_, { voucherCode }, { user, pgdb, t, mail }) => {
  debug('begin', { voucherCode, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result = await claim(voucherCode, user, t, transaction, mail)
    await transaction.transactionCommit()

    debug('commit', { voucherCode, user: user.id })

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { voucherCode, user: user.id })

    throw e
  }
}
