const { Roles } = require('@orbiting/backend-modules-auth')
const matchPayments = require('../../../lib/payments/matchPayments')

module.exports = async (_, args, {pgdb, req, t, redis}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')

  const transaction = await pgdb.transactionBegin()
  try {
    const {
      numMatchedPayments,
      numUpdatedPledges,
      numPaymentsSuccessful
    } = await matchPayments(transaction, t, redis)

    await transaction.transactionCommit()
    const result = `
rematchPayments result:
num matched payments: ${numMatchedPayments}
num updated pledges: ${numUpdatedPledges}
num payments successfull: ${numPaymentsSuccessful}
    `
    console.log(result)
    return result
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
