const debug = require('debug')('access:mutation:grantAccess')

const grantsLib = require('../../../lib/grants')

module.exports = async (_, { campaignId, email }, { user, pgdb, t, mail }) => {
  debug('begin', { campaignId, email, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result =
      await grantsLib.grant(user, campaignId, email, t, transaction, mail)
    await transaction.transactionCommit()

    debug('commit', { campaignId, email, user: user.id })

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { campaignId, email, user: user.id })

    throw e
  }
}
