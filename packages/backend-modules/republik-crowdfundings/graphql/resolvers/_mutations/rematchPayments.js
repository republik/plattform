const { Roles } = require('@orbiting/backend-modules-auth')
const matchPayments = require('../../../lib/payments/matchPayments')
const { refreshAllPots } = require('../../../lib/membershipPot')

module.exports = async (_, args, context) => {
  const { pgdb, req, t, redis } = context
  Roles.ensureUserHasRole(req.user, 'supporter')

  const transaction = await pgdb.transactionBegin()
  try {
    const { numMatchedPayments, numUpdatedPledges, numPaymentsSuccessful } =
      await matchPayments(transaction, t, redis)

    await transaction.transactionCommit()
    const result = `
rematchPayments result:
num matched payments: ${numMatchedPayments}
num updated pledges: ${numUpdatedPledges}
num payments successful: ${numPaymentsSuccessful}
    `
    context.logger.info(result)
    return result
  } catch (e) {
    await transaction.transactionRollback()
    context.loggegr.error({ args, error: e }, 'rematch payments failed')
    throw e
  } finally {
    await refreshAllPots({ pgdb }).catch((e) => {
      context.logger.error({ error: e }, 'error after matchPayments')
    })
  }
}
