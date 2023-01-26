const { PAYMENT_DEADLINE_DAYS } = require('./helpers')

module.exports = async ({
  pledgeId,
  total,
  paperInvoice = false,
  transaction,
  createdAt: createdAtInput,
}) => {
  // only count PAYMENTSLIP payments up to CHF 1000.- immediately
  const pledgeStatus = total > 100000 ? 'WAITING_FOR_PAYMENT' : 'SUCCESSFUL'

  const createdAt = createdAtInput || new Date()
  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'PAYMENTSLIP',
    total: total,
    status: 'WAITING',
    paperInvoice,
    dueDate: new Date(createdAt).setDate(
      createdAt.getDate() + PAYMENT_DEADLINE_DAYS,
    ),
    createdAt,
  })

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  return pledgeStatus
}
