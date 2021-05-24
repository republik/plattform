const createCustomer = require('./createCustomer')
const createCharge = require('./createCharge')
const createSubscription = require('./createSubscription')
const addSource = require('./addSource')
const addPaymentMethod = require('./addPaymentMethod')
const getClients = require('./clients')
const createPaymentIntent = require('./createPaymentIntent')
const sleep = require('await-sleep')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')

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
  console.info(`stripe ${kind} failed`, { pledgeId, e })
  if (e.type === 'StripeCardError') {
    const translatedError = t('api/pay/stripe/' + e.code)
    if (translatedError) {
      throw new Error(translatedError)
    } else {
      console.warn('translation not found for stripe error', { pledgeId, e })
      throw new Error(e.message)
    }
  } else {
    console.error('unknown error on stripe charge', { pledgeId, e })
    throw new Error(t('api/unexpected'))
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
  pspPayload,
  makeDefault = false,
  userId,
  pkg,
  pgdb,
  t,
}) => {
  const { companyId } = pkg

  const isSubscription = pkg.name === 'MONTHLY_ABO'

  if (!stripePlatformPaymentMethodId) {
    console.error('missing stripePlatformPaymentMethodId')
    throw new Error(t('api/unexpected'))
  }

  const clients = await getClients(pgdb)

  // save paymentMethodId (to platform and connectedAccounts)
  if (
    !(await pgdb.public.stripeCustomers.findFirst({
      userId,
    }))
  ) {
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

  let stripeClientSecret
  let stripePaymentIntentId
  if (!isSubscription) {
    const paymentIntent = await createPaymentIntent({
      userId,
      companyId,
      platformPaymentMethodId: stripePlatformPaymentMethodId,
      total,
      pledgeId,
      pgdb,
      clients,
      t,
    })
    stripePaymentIntentId = paymentIntent.id
    if (paymentIntent.status !== 'succeeded') {
      stripeClientSecret = paymentIntent.client_secret
    }
  } else {
    // subscribe to get clientSecret from webhooks:
    // invoicePaymentActionRequired or invoicePaymentSucceeded
    let noAuthRequired
    const subscriber = Redis.connect()
    subscriber.on('message', (channel, rawMessage) => {
      const { id, clientSecret } = JSON.parse(rawMessage)
      stripePaymentIntentId = id
      if (clientSecret === 'no-auth-required') {
        noAuthRequired = true
      } else {
        stripeClientSecret = clientSecret
      }
    })
    subscriber.subscribe(`pledge:${pledgeId}:paymentIntent`)

    await createSubscription({
      plan: pkg.name,
      userId,
      companyId: pkg.companyId,
      metadata: {
        pledgeId,
      },
      pgdb,
      clients,
    })

    // wait 25s max
    const maxMs = new Date().getTime() + 25 * 1000
    await (async () => {
      while (
        !noAuthRequired && // eslint-disable-line no-unmodified-loop-condition
        !stripeClientSecret && // eslint-disable-line no-unmodified-loop-condition
        new Date().getTime() < maxMs
      ) {
        await sleep(500)
      }
    })()

    // we didn't receive a webhook (or redis publish) in time
    if (!stripePaymentIntentId) {
      console.error(
        `payPledge didn't receive the paymentIntent in time for pledgeId: ${pledgeId}`,
      )
      throw new Error(t('api/unexpected'))
    }

    subscriber.unsubscribe()
    Redis.disconnect(subscriber)
  }

  // get stripe client for companyId
  const account = clients.accountForCompanyId(pkg.companyId)
  if (!account) {
    throw new Error(`could not find account for companyId: ${pkg.companyId}`)
  }

  return {
    status: 'DRAFT',
    stripeClientSecret,
    stripePublishableKey: account.publishableKey,
    stripePaymentIntentId,
    companyId: pkg.companyId,
  }
}
