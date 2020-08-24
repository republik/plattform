const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { paymentSources: getPaymentSources } = require('../User')
const addSource = require('../../../lib/payments/stripe/addSource')
const createCustomer = require('../../../lib/payments/stripe/createCustomer')

module.exports = async (_, { sourceId, pspPayload }, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)
  const userId = me.id

  // adding a threeD secure source is not supported
  // we would need to attach the source.three_d_secure.card source
  // and make sure to route the first payment through makeCharge
  if (pspPayload.type === 'three_d_secure') {
    throw new Error(t('api/payment/subscription/threeDsecure/notSupported'))
  }

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
