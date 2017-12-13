const PAYMENT_DEADLINE_DAYS = 30

module.exports = async ({
  pledgeId,
  total,
  address,
  paperInvoice = false,
  userId,
  transaction,
  t,
  logger = console
}) => {
  if (!address) {
    logger.error('PAYMENTSLIP payments must include an address', { userId, pledgeId, total, address, paperInvoice })
    throw new Error(t('api/unexpected'))
  }

  // insert address
  const newAddress = await transaction.public.addresses.insertAndGet(address)
  await transaction.public.users.updateAndGetOne({
    id: userId
  }, {
    addressId: newAddress.id
  })

  // only count PAYMENTSLIP payments up to CHF 1000.- immediately
  const pledgeStatus = (total > 100000)
    ? 'WAITING_FOR_PAYMENT'
    : 'SUCCESSFUL'

  const now = new Date()
  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'PAYMENTSLIP',
    total: total,
    status: 'WAITING',
    paperInvoice,
    dueDate: new Date(now).setDate(now.getDate() + PAYMENT_DEADLINE_DAYS)
  })

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE'
  })

  return pledgeStatus
}
