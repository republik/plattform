const {
  getValidResolvedToken,
} = require('@orbiting/backend-modules-auth/lib/AccessToken')
const {
  initTransaction,
  getMerchant,
  formatHridAsRefno,
} = require('../../../lib/helpers')

async function checkPledgeValidity(pledgeId, { pgdb, loaders }) {
  const pledge = await loaders.Pledge.byId.load(pledgeId)
  if (!pledge) {
    throw new Error('pledgeId not found')
  }

  if (pledge.status !== 'DRAFT') {
    throw new Error('pledge not in status "DRAFT"')
  }

  const pkg = await pgdb.public.packages.findOne({ id: pledge.packageId })
  if (!pkg) {
    throw new Error('package not found')
  }
  return { pledge, pkg }
}

async function updatePaymentWithTransactionId({ paymentId, transactionId, args }, tx, { req, t }) {
  try {
    await tx.public.payments.updateOne(
      { id: paymentId },
      { pspId: transactionId, pspPayload: args },
    )
    tx.transactionCommit()
  }  catch (e) {
    await tx.transactionRollback()
    console.info('update payment after init transaction rollback', { req: req._log(), args, error: e })
    throw new Error(t('api/unexpected'))
  }
}

module.exports = async (_, args, context) => {
  const { pledgeId, method, accessToken } = args
  const { loaders, pgdb, req, t } = context

  const initPaymentTx = await pgdb.transactionBegin()

  try {
    const { pledge, pkg } = await checkPledgeValidity(pledgeId, { pgdb, loaders })

    const pledgeOptionsWithAutoPay = await pgdb.public.pledgeOptions.count({
      pledgeId,
      autoPay: true,
    })

    // insert payment
    const payment = await initPaymentTx.public.payments.insertAndGet({
      type: 'PLEDGE',
      method,
      total: pledge.total,
      status: 'WAITING',
    })

    // insert pledgePayment
    await initPaymentTx.public.pledgePayments.insert({
      pledgeId,
      paymentId: payment.id,
      paymentType: 'PLEDGE',
    })

    const hasValidToken =
      !!accessToken && (await getValidResolvedToken(accessToken, context))

    const { transactionId, authorizeUrl } = await initTransaction({
      merchant: getMerchant(pkg.companyId),
      pledgeId: pledge.id,
      paymentId: payment.id,
      refno: formatHridAsRefno(payment.hrid),
      amount: pledge.total,
      method,
      createAlias: pledgeOptionsWithAutoPay > 0, // if we want to save credit cards also from single payments we would need to create an alias here for credit card payments
      accessToken: hasValidToken && accessToken,
    })

    await initPaymentTx.transactionCommit()

    const updatePaymentTx = await pgdb.transactionBegin()
    await updatePaymentWithTransactionId({ paymentId: payment.id, transactionId, args }, updatePaymentTx, { req, t })

    return { authorizeUrl }
  } catch (e) {
    await initPaymentTx.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw new Error(t('api/unexpected'))
  }
}
