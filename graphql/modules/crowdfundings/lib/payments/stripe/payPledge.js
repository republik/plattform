const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = async ({
  pledgeId,
  total,
  sourceId,
  userId,
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
    charge = await stripe.charges.create({
      amount: total,
      currency: 'chf',
      source: sourceId
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

  // save sourceId to user
  await transaction.public.paymentSources.insert({
    userId,
    method: 'STRIPE',
    pspId: charge.source.id,
    pspPayload: charge.source
  })

  return 'SUCCESSFUL'
}
