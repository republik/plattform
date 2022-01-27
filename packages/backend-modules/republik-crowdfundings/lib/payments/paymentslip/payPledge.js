const { PAYMENT_DEADLINE_DAYS } = require('./helpers')

module.exports = async ({
  pledgeId,
  total,
  paperInvoice = false,
  transaction,
}) => {
  // only count PAYMENTSLIP payments up to CHF 1000.- immediately
  const pledgeStatus = total > 100000 ? 'WAITING_FOR_PAYMENT' : 'SUCCESSFUL'

  const now = new Date()
  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'PAYMENTSLIP',
    total: total,
    status: 'WAITING',
    paperInvoice,
    dueDate: new Date(now).setDate(now.getDate() + PAYMENT_DEADLINE_DAYS),
  })

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  return pledgeStatus
}
