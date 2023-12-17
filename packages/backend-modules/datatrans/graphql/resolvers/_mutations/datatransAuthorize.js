const { authorizeTransaction } = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { pledgeId, sourceId } = args
  const { loaders, pgdb, user: me } = context

  const pledge = await loaders.Pledge.byId.load(pledgeId)
  if (!pledge) {
    throw new Error('pledge not found')
  }

  if (pledge.status !== 'DRAFT') {
    throw new Error('pledge status not DRAFT')
  }

  const paymentSource = await pgdb.public.paymentSources.findOne({
    id: sourceId,
    userId: me.id,
  })
  if (!paymentSource) {
    throw new Error('noting found')
  }

  const tx = await pgdb.transactionBegin()

  try {
    // insert payment
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

    const { transactionId } = await authorizeTransaction({
      refno: payment.hrid,
      amount: pledge.total,
      alias: paymentSource.pspPayload,
    })

    await tx.public.payments.updateOne(
      { id: payment.id },
      { pspId: transactionId, pspPayload: args },
    )

    await tx.transactionCommit()
    return { paymentId: payment.id }
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}