const createCustomer = require('./createCustomer')
const createCharge = require('./createCharge')
const createSubscription = require('./createSubscription')
const addSource = require('./addSource')

module.exports = async ({
  pledgeId,
  total,
  sourceId,
  paymentMethodId,
  pspPayload,
  makeDefault = false,
  userId,
  pkg,
  transaction,
  pgdb,
  t,
  logger = console,
}) => {
  const isSubscription = pkg.name === 'MONTHLY_ABO'

  // old charge threeDSecure
  const threeDSecure = pspPayload && pspPayload.type === 'three_d_secure'
  const rememberSourceId = threeDSecure
    ? pspPayload.three_d_secure.card
    : sourceId
  if (isSubscription && threeDSecure) {
    throw new Error(t('api/payment/subscription/threeDsecure/notSupported'))
  }

  // paymentIntent payments are setteled via webhook
  if (paymentMethodId && !isSubscription) {
    console.log('paymentMethodId && !isSubscription -> SUCCESSFUL')
    return 'SUCCESSFUL'
  }

  let charge
  try {
    let deduplicatedSourceId
    // paymentMethod is saved to customer in submitPledge
    if (!paymentMethodId) {
      if (!(await pgdb.public.stripeCustomers.findFirst({ userId }))) {
        if (!rememberSourceId) {
          logger.error('missing sourceId or paymentMethodId', {
            userId,
            pledgeId,
            sourceId,
          })
          throw new Error(t('api/unexpected'))
        }
        await createCustomer({
          sourceId: rememberSourceId,
          userId,
          pgdb,
        })
      } else {
        // stripe customer exists
        deduplicatedSourceId = await addSource({
          sourceId: rememberSourceId,
          userId,
          pgdb,
          deduplicate: true,
          makeDefault,
        })
      }
    }

    if (isSubscription) {
      console.log('createSubscription...')
      await createSubscription({
        plan: pkg.name,
        userId,
        companyId: pkg.companyId,
        metadata: {
          pledgeId,
        },
        ...(paymentMethodId ? { default_payment_method: paymentMethodId } : {}),
        pgdb: transaction,
      })
    } else {
      charge = await createCharge({
        amount: total,
        userId,
        companyId: pkg.companyId,
        sourceId: threeDSecure ? sourceId : deduplicatedSourceId || sourceId,
        threeDSecure,
        pgdb: transaction,
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
  if (!isSubscription && !paymentMethodId) {
    // save payment
    const payment = await transaction.public.payments.insertAndGet({
      type: 'PLEDGE',
      method: 'STRIPE',
      total: charge.amount,
      status: 'PAID',
      pspId: charge.id,
      pspPayload: charge,
    })

    // insert pledgePayment
    await transaction.public.pledgePayments.insert({
      pledgeId,
      paymentId: payment.id,
      paymentType: 'PLEDGE',
    })
  }

  return 'SUCCESSFUL'
}
