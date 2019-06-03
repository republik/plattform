const debug = require('debug')('access:mutation:grantAccess')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { grant } = require('../../../lib/grants')

module.exports = async (_, { campaignId, email, message }, { req, user, pgdb, t, mail }) => {
  ensureSignedIn(req)
  debug('begin', { campaignId, email, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result = await grant(user, campaignId, email, message, t, transaction, mail)
    await transaction.transactionCommit()

    debug('commit', { campaignId, email, user: user.id })

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { campaignId, email, user: user.id })

    throw e
  }
}
