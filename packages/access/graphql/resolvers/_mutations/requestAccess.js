const debug = require('debug')('access:mutation:requestAccess')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { request } = require('../../../lib/grants')

module.exports = async (_, { campaignId }, { req, user, pgdb, t, mail }) => {
  ensureSignedIn(req)
  debug('begin', { campaignId, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result = await request(user, campaignId, t, transaction, mail)
    await transaction.transactionCommit()

    debug('commit', { campaignId, user: user.id })

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { campaignId, user: user.id })

    throw e
  }
}
