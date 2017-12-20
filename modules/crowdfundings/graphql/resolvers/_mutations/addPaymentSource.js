const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { paymentSources: getPaymentSources } = require('../User')
const addSource = require('../../../lib/payments/stripe/addSource')
const createCustomer = require('../../../lib/payments/stripe/createCustomer')

module.exports = async (_, { sourceId }, { pgdb, req, user: me }) => {
  ensureSignedIn(req)
  const userId = me.id

  const transaction = await pgdb.transactionBegin()
  try {
    if (!(await transaction.public.stripeCustomers.findFirst({ userId }))) {
      await createCustomer({
        sourceId,
        userId,
        pgdb: transaction
      })
    } else {
      await addSource({
        sourceId,
        userId,
        pgdb: transaction,
        deduplicate: true,
        makeDefault: true
      })
    }

    await transaction.transactionCommit()

    return await getPaymentSources(me, null, { pgdb, user: me })
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), error: e })
    throw e
  }
}
