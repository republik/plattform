const { initTransaction } = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { pledgeId, method } = args
  const { loaders, pgdb } = context

  const pledge = await loaders.Pledge.byId.load(pledgeId)
  if (!pledge) {
    throw new Error('pledge not found')
  }
  if (pledge.status !== 'DRAFT') {
    throw new Error('pledge status not DRAFT')
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

    const { transactionId, authorizeUrl } = await initTransaction({
      pledgeId: pledge.id,
      paymentId: payment.id,
      refno: payment.hrid,
      amount: pledge.total,
      method,
      createAlias: pledgeOptionsWithAutoPay > 0,
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
