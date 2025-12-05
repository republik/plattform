const debug = require('debug')('access:mutation:claimAccess')

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { claim } = require('../../../lib/grants')

module.exports = async (
  _,
  { voucherCode, payload },
  { req, user, pgdb, redis, t, mail },
) => {
  ensureSignedIn(req)
  await ensureUserHasNoNewSubscription(user, pgdb, t)
  debug('begin', { voucherCode, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const result = await claim(
      voucherCode,
      payload,
      user,
      t,
      transaction,
      redis,
      mail,
    )
    await transaction.transactionCommit()

    debug('commit', { voucherCode, user: user.id })

    return result
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { voucherCode, user: user.id })

    throw e
  }
}

async function ensureUserHasNoNewSubscription(user, pgdb, t) {
  const result = await pgdb.payments.subscriptions.findFirst(
    {
      userId: user.id,
      status: ['active', 'past_due', 'unpaid', 'paused'],
    },
    { fields: ['id'] },
  )

  if (result) {
    throw new Error(
      t('api/access/claim/can-not-claim-access-with-active-subscription'),
    )
  }
}
