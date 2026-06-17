const debug = require('debug')('access:mutation:requestAccess')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { request } = require('../../../lib/grants')

let recordGiftConversion
try {
  ;({ recordGiftConversion } = require('@orbiting/backend-modules-gift-articles/lib/attribution'))
} catch {
  recordGiftConversion = null
}

module.exports = async (
  _,
  { campaignId, payload },
  { req, user, pgdb, redis, t, mail },
) => {
  ensureSignedIn(req)
  debug('begin', { campaignId, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result = await request(
      user,
      campaignId,
      payload,
      t,
      transaction,
      redis,
      mail,
    )
    await transaction.transactionCommit()

    debug('commit', { campaignId, user: user.id })

    if (recordGiftConversion) {
      recordGiftConversion(pgdb, user.id, payload, 'trial').catch(() => {})
    }

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { campaignId, user: user.id })

    throw e
  }
}
