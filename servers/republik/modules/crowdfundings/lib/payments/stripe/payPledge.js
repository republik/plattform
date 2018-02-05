const createCustomer = require('./createCustomer')
const createCharge = require('./createCharge')
const createSubscription = require('./createSubscription')
const addSource = require('./addSource')

module.exports = async ({
  pledgeId,
  total,
  sourceId,
  pspPayload,
  userId,
  pkg,
  transaction,
  pgdb,
  t,
  logger = console
}) => {
  let isSubscription = pkg.name === 'MONTHLY_ABO'

  const threeDSecure = pspPayload && pspPayload.type === 'three_d_secure'
  const rememberSourceId = threeDSecure
    ? pspPayload.three_d_secure.card
    : sourceId

  if (isSubscription && threeDSecure) {
    throw new Error(t('api/payment/subscription/threeDsecure/notSupported'))
  }

  let charge
  try {
    let deduplicatedSourceId
    if (!(await pgdb.public.stripeCustomers.findFirst({ userId }))) {
      if (!rememberSourceId) {
        logger.error('missing sourceId', { userId, pledgeId, sourceId })
        throw new Error(t('api/unexpected'))
      }
      await createCustomer({
        sourceId: rememberSourceId,
        userId,
        pgdb
      })
    } else { // stripe customer exists
      deduplicatedSourceId = await addSource({
        sourceId: rememberSourceId,
        userId,
        pgdb,
        deduplicate: true
      })
    }

    if (isSubscription) {
      await createSubscription({
        plan: pkg.name,
        userId,
        companyId: pkg.companyId,
        metadata: {
          pledgeId
        },
        pgdb: transaction
      })
    } else {
      charge = await createCharge({
        amount: total,
        userId,
        companyId: pkg.companyId,
        sourceId: threeDSecure
          ? sourceId
          : deduplicatedSourceId || sourceId,
        threeDSecure,
        pgdb: transaction
      })
    }
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

  // for subscriptions the payment doesn't exist yet
  // and is saved by the webhookHandler
  if (!isSubscription) {
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
  }

  return 'SUCCESSFUL'
}
