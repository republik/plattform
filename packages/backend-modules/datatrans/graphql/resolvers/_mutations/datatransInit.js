const { initTransaction } = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { pledgeId, service } = args
  const { loaders, pgdb } = context

  const pledge = await loaders.Pledge.byId.load(pledgeId)

  if (pledge.status !== 'DRAFT') {
    throw new Error('bla')
  }

  const pledgeOptionsWithAutoPay = await pgdb.public.pledgeOptions.count({
    pledgeId,
    autoPay: true,
  })

  const tx = await pgdb.transactionBegin()

  try {
    const payment = await tx.public.payments.insertAndGet({
      type: 'PLEDGE',
      method: 'DATATRANS',
      total: pledge.total,
      status: 'WAITING',
    })
    // insert pledgePayment
    await tx.public.pledgePayments.insert({
      pledgeId,
      paymentId: payment.id,
      paymentType: 'PLEDGE',
    })

    const { authorizeUrl } = await initTransaction({
      refno: payment.hrid,
      amount: pledge.total,
      service,
      createAlias: pledgeOptionsWithAutoPay > 0,
      pledgeId: pledge.id,
      paymentId: payment.id,
    })
    await tx.transactionCommit()
    return { authorizeUrl }
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
