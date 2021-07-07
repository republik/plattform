const debug = require('debug')('crowdfundings:lib:payments:stripe:payPledge')

const { RequiresPaymentMethodError, throwError } = require('./Errors')

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
      throwError(e, { ...args, kind: 'paymentIntent' })
    })
  }
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
    throwError(e, { pledgeId, t, kind: 'charge' })
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
    throw new Error(t('missing stripePlatformPaymentMethodId'))
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
  }

  if (makeDefault) {
    await rememberUpdateDefaultPaymentMethod(
      stripePlatformPaymentMethodId,
      userId,
      companyId,
      pgdb,
    )
  }

  const isSubscription = pkg.name === 'MONTHLY_ABO'
  let paymentIntent
  if (isSubscription) {
    const subscription = await createSubscription({
      plan: pkg.name,
      userId,
      companyId,
      platformPaymentMethodId: stripePlatformPaymentMethodId,
      metadata: {
        pledgeId,
      },
      pgdb,
      clients,
      t,
    })

    paymentIntent = subscription.latest_invoice?.payment_intent
    if (!paymentIntent) {
      throw new Error(
        `payPledge didn't receive the paymentIntent for subscription pledgeId: ${pledgeId}`,
      )
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

  if (paymentIntent.status !== 'succeeded') {
    debug('unsuccessful payment intent %o', {
      pledgeId,
      companyId,
      packageName: pkg.name,
      isSubscription,
      intentId: paymentIntent.id,
      intentStatus: paymentIntent.status,
      client_secret: !!paymentIntent.client_secret,
    })
  } else {
    await maybeUpdateDefaultPaymentMethod(userId, addPaymentMethod, pgdb).catch(
      (e) => console.warn(e),
    )
  }

  // We consider a payment intent requiring (another) payment method as failed.
  if (paymentIntent.status === 'requires_payment_method') {
    throw new RequiresPaymentMethodError(paymentIntent)
  }

  if (paymentIntent.status === 'canceled') {
    throw new Error('payment_intent.status returned "canceled"')
  }

  const isClientSecretNecessary = [
    'requires_confirmation',
    'requires_action',
  ].includes(paymentIntent.status)
  const stripePaymentIntentId = paymentIntent.id
  const stripeClientSecret =
    (isClientSecretNecessary && paymentIntent.client_secret) || undefined

  // get stripe client for companyId
  const account = clients.accountForCompanyId(companyId)
  if (!account) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  return {
    status: 'DRAFT',
    stripePaymentIntentId,
    stripeClientSecret,
    stripePublishableKey: account.publishableKey,
    companyId,
  }
}
