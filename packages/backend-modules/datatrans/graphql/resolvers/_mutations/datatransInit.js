const {
  getValidResolvedToken,
} = require('@orbiting/backend-modules-auth/lib/AccessToken')
const {
  initTransaction,
  getMerchant,
  formatHridAsRefno,
} = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { pledgeId, method, accessToken } = args
  const { loaders, pgdb } = context

  const pledge = await loaders.Pledge.byId.load(pledgeId)
  if (!pledge) {
    throw new Error('pledge not found')
  }

  if (pledge.status !== 'DRAFT') {
    throw new Error('pledge status not DRAFT')
  }

  const pkg = await pgdb.public.packages.findOne({ id: pledge.packageId })
  if (!pkg) {
    throw new Error('package not found')
  }

  const pledgeOptionsWithAutoPay = await pgdb.public.pledgeOptions.count({
    pledgeId,
    autoPay: true,
  })

  const tx = await pgdb.transactionBegin()

  try {
    // insert payment
    const payment = await tx.public.payments.insertAndGet({
      type: 'PLEDGE',
      method,
      total: pledge.total,
      status: 'WAITING',
    })

    // insert pledgePayment
    await tx.public.pledgePayments.insert({
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
      createAlias: pledgeOptionsWithAutoPay > 0,
      accessToken: hasValidToken && accessToken,
    })

    await tx.public.payments.updateOne(
      { id: payment.id },
      { pspId: transactionId, pspPayload: args },
    )

    await tx.transactionCommit()
    return { authorizeUrl }
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
