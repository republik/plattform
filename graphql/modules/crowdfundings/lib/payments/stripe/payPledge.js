const createCustomer = require('./createCustomer')
const createCharge = require('./createCharge')

module.exports = async ({
  pledgeId,
  total,
  sourceId,
  userId,
  pkg,
  transaction,
  t,
  logger = console
}) => {
  if (!sourceId) {
    logger.error('sourceId required', { pledgeId, sourceId })
    throw new Error(t('api/unexpected'))
  }

  let charge
  try {
    if (!(await transaction.public.stripeCustomers.findFirst({ userId }))) {
      await createCustomer({
        sourceId,
        userId,
        pgdb: transaction
      })
    } else {
      console.warn(
        'payPledge: user already has a stripeCustomer, ignoring new source', { userId }
      )
    }

    charge = await createCharge({
      amount: total,
      userId,
      companyId: pkg.companyId,
      pgdb: transaction
    })
  } catch (e) {
    logger.info('stripe charge failed', { pledgeId, e })
    if (e.type === 'StripeCardError') {
      const translatedError = t('api/pay/stripe/' + e.code)
      if (translatedError) {
        throw new Error(translatedError)
      } else {
        logger.warn('translation not found for stripe error', { pledgeId, e })
        throw new Error(e.message)
      }
    } else {
      logger.error('unknown error on stripe charge', { pledgeId, e })
      throw new Error(t('api/unexpected'))
    }
  }

  // save payment
  const payment = await transaction.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: 'STRIPE',
    total: charge.amount,
    status: 'PAID',
    pspId: charge.id,
    pspPayload: charge
  })

  // insert pledgePayment
  await transaction.public.pledgePayments.insert({
    pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE'
  })

  return 'SUCCESSFUL'
}
