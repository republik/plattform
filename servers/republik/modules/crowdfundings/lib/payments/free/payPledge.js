module.exports = async ({
  pledgeId,
  total,
  userId,
  transaction,
  t,
  logger = console
}) => {
  const pledgeStatus = 'SUCCESSFUL'

  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'FREE',
    total: total,
    status: 'PAID'
  })

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE'
  })

  return pledgeStatus
}
