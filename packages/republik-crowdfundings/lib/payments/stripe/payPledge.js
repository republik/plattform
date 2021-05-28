const createCustomer = require('./createCustomer')
const createCharge = require('./createCharge')
const createSubscription = require('./createSubscription')
const addSource = require('./addSource')
const addPaymentMethod = require('./addPaymentMethod')
const getClients = require('./clients')
const createPaymentIntent = require('./createPaymentIntent')
const {
  rememberUpdateDefault: rememberUpdateDefaultPaymentMethod,
  maybeUpdateDefault: maybeUpdateDefaultPaymentMethod,
} = require('./paymentMethod')

module.exports = (args) => {
  const { sourceId, t } = args
  if (!sourceId) {
    console.error('missing sourceId', args)
    throw new Error(t('api/unexpected'))
  }
  if (sourceId.startsWith('src_')) {
    return payWithSource(args)
  } else {
    return payWithPaymentMethod({
      ...args,
      stripePlatformPaymentMethodId: args.sourceId,
    }).catch((e) => {
      throwStripeError(e, { ...args, kind: 'paymentIntent' })
    })
  }
}

const throwStripeError = (e, { pledgeId, t, kind }) => {
  if (e.type === 'StripeCardError') {
    const translatedError = t('api/pay/stripe/' + e.code)
    if (translatedError) {
      console.warn('stripe error', { pledgeId, kind, e })
      throw new Error(translatedError)
    } else {
      console.warn('translation not found for stripe error', {
        pledgeId,
        kind,
        e,
      })
      throw new Error(e.message)
    }
  }

  console.error('unknown error on stripe charge', { pledgeId, kind, e })
  throw new Error(t('api/unexpected'))
}

const payWithSource = async ({
  pledgeId,
  total,
  sourceId,
  pspPayload,
  makeDefault = false,
  userId,
  pkg,
  transaction,
  pgdb,
  t,
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

  let charge
  try {
    let deduplicatedSourceId
    if (!(await pgdb.public.stripeCustomers.findFirst({ userId }))) {
      if (!rememberSourceId) {
        console.error('missing sourceId', {
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

    if (isSubscription) {
      await createSubscription({
        plan: pkg.name,
        userId,
        companyId: pkg.companyId,
        metadata: {
          pledgeId,
        },
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
    throwStripeError(e, { pledgeId, t, kind: 'charge' })
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
      pspPayload: charge,
    })

    // insert pledgePayment
    await transaction.public.pledgePayments.insert({
      pledgeId,
      paymentId: payment.id,
      paymentType: 'PLEDGE',
    })
  }

  return {
    status: 'SUCCESSFUL',
  }
}

const payWithPaymentMethod = async ({
  pledgeId,
  total,
  stripePlatformPaymentMethodId,
  makeDefault = false,
  userId,
  pkg,
  pgdb,
  t,
}) => {
  const { companyId } = pkg

  if (!stripePlatformPaymentMethodId) {
    console.error('missing stripePlatformPaymentMethodId')
    throw new Error(t('api/unexpected'))
  }

  const clients = await getClients(pgdb)

  const isExistingCustomer = !!(await pgdb.public.stripeCustomers.count({
    userId,
  }))

  if (!isExistingCustomer) {
    await createCustomer({
      paymentMethodId: stripePlatformPaymentMethodId,
      userId,
      pgdb,
      clients,
    })
  } else {
    await addPaymentMethod({
      paymentMethodId: stripePlatformPaymentMethodId,
      userId,
      pgdb,
      clients,
    })

    if (makeDefault) {
      await rememberUpdateDefaultPaymentMethod(
        stripePlatformPaymentMethodId,
        userId,
        companyId,
        pgdb,
      )
    }
  }

  const isSubscription = pkg.name === 'MONTHLY_ABO'
  let paymentIntent
  if (isSubscription) {
    const subscription = await createSubscription({
      plan: pkg.name,
      userId,
      companyId,
      metadata: {
        pledgeId,
      },
      pgdb,
      clients,
    })

    paymentIntent = subscription.latest_invoice?.payment_intent
    if (!paymentIntent) {
      console.error(
        `payPledge didn't receive the paymentIntent for subscription pledgeId: ${pledgeId}`,
      )
      throw new Error(t('api/unexpected'))
    }
  } else {
    paymentIntent = await createPaymentIntent({
      userId,
      companyId,
      platformPaymentMethodId: stripePlatformPaymentMethodId,
      total,
      pledgeId,
      pgdb,
      clients,
      t,
    })
  }

  const stripePaymentIntentId = paymentIntent.id
  const stripeClientSecret =
    (paymentIntent.status !== 'succeeded' && paymentIntent.client_secret) ||
    undefined

  if (paymentIntent.status === 'succeeded') {
    await maybeUpdateDefaultPaymentMethod(userId, addPaymentMethod, pgdb).catch(
      (e) => console.warn(e),
    )
  }

  // get stripe client for companyId
  const account = clients.accountForCompanyId(companyId)
  if (!account) {
    console.error(`could not find account for companyId: ${companyId}`)
    throw new Error(t('api/unexpected'))
  }

  return {
    status: 'DRAFT',
    stripeClientSecret,
    stripePublishableKey: account.publishableKey,
    stripePaymentIntentId,
    companyId,
  }
}
