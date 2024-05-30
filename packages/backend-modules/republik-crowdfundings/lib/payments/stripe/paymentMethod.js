const Promise = require('bluebird')
const debug = require('debug')(
  'crowdfundings:lib:payments:stripe:paymentMethod',
)

const getStripeClients = require('./clients')

const CACHE_KEY = 'paymentMethods'
const UPDATE_DEFAULT_TTL = 1000 * 60 * 60 // 1 hour

const getPaymentMethods = async ({
  userId,
  pgdb,
  clients, // optional
  acceptCachedData = false,
}) => {
  const { platform, connectedAccounts } =
    clients || (await getStripeClients(pgdb))
  if (!platform) {
    return []
  }

  const customers = await pgdb.public.stripeCustomers.find({
    userId,
  })
  const customer = customers.find((c) => c.companyId === platform.company.id)
  if (!customer) {
    return []
  }
  if (customers.length !== connectedAccounts.length + 1) {
    throw new Error(`missing stripeCustomer for userId: ${userId}`)
  }

  if (acceptCachedData && customer.cache?.[CACHE_KEY]) {
    return customer.cache[CACHE_KEY]
  }

  const [stripeCustomer, paymentMethods, connectedAccountsPaymentMethods] =
    await Promise.all([
      platform.stripe.customers.retrieve(customer.id),
      platform.stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card',
      }),
      Promise.map(connectedAccounts, async (connectedAccount) => {
        const connectedCustomer = customers.find(
          (c) => c.companyId === connectedAccount.company.id,
        )
        const cpms = await platform.stripe.paymentMethods.list(
          {
            customer: connectedCustomer.id,
            type: 'card',
          },
          {
            stripeAccount: connectedAccount.accountId,
          },
        )
        return {
          companyId: connectedAccount.company.id,
          accountId: connectedAccount.accountId,
          paymentMethods: cpms.data,
        }
      }),
    ])
  if (!stripeCustomer || !paymentMethods) {
    return []
  }

  // add connected paymentMethods to paymentMethods.connectedPaymentMethods
  for (const ca of connectedAccountsPaymentMethods) {
    const { companyId } = ca
    for (const cpm of ca.paymentMethods) {
      const { original_payment_method_id } = cpm.metadata
      if (original_payment_method_id) {
        const pm = paymentMethods.data.find(
          (pm) => pm.id === original_payment_method_id,
        )
        if (!pm.connectedPaymentMethods) {
          pm.connectedPaymentMethods = []
        }
        pm.connectedPaymentMethods.push({
          id: cpm.id,
          companyId,
        })
      }
    }
  }

  const result = paymentMethods.data.map((pm) => ({
    id: pm.id,
    isDefault:
      pm.id === stripeCustomer.invoice_settings?.default_payment_method,
    // in contrast to sources, status is not available from stripe
    status: 'CHARGEABLE',
    card: {
      brand: pm.card.brand,
      wallet: pm.card.wallet?.type,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    },
    companyId: platform.company.id,
    connectedPaymentMethods: pm.connectedPaymentMethods,
  }))

  await pgdb.public.stripeCustomers.updateOne(
    { id: customer.id },
    {
      cache: {
        ...customer.cache,
        [CACHE_KEY]: result,
      },
    },
  )

  return result
}

exports.getPaymentMethods = getPaymentMethods

exports.getDefaultPaymentMethod = async ({
  userId,
  pgdb,
  clients, // optional
  acceptCachedData,
}) => {
  const paymentMethods = await getPaymentMethods({
    userId,
    pgdb,
    clients,
    acceptCachedData,
  })
  return paymentMethods.find((pm) => pm.isDefault)
}

exports.getPaymentMethodForCompany = async ({
  userId,
  companyId,
  platformPaymentMethodId, // optional: if ommited, the default is used
  pgdb,
  clients: _clients = null, // optional
  t,
  acceptCachedData,
}) => {
  const clients = _clients || (await getStripeClients(pgdb))

  // load all paymentMethods and select the one for companyId
  const paymentMethods = await getPaymentMethods({
    userId,
    pgdb,
    clients,
    acceptCachedData,
  })

  const platformPaymentMethod = paymentMethods.find((pm) =>
    platformPaymentMethodId ? pm.id === platformPaymentMethodId : pm.isDefault,
  )

  let paymentMethod
  if (platformPaymentMethod.companyId === companyId) {
    paymentMethod = platformPaymentMethod
  } else {
    paymentMethod = platformPaymentMethod.connectedPaymentMethods.find(
      (cpm) => cpm.companyId === companyId,
    )
  }

  if (!paymentMethod) {
    console.error(
      `missing paymentMethod userId: ${userId} companyId: ${companyId}`,
    )
    throw new Error(t('api/unexpected'))
  }

  return paymentMethod
}

/**
 * Remember which Stripe payment method ID should become default.
 */
exports.rememberUpdateDefault = async (
  paymentMethodId,
  userId,
  companyId,
  pgdb,
) => {
  debug('rememberUpdateDefault %o', { paymentMethodId, userId, companyId })

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId,
  })
  const { payload = {} } = customer

  const updateDefault = {
    paymentMethodId,
    requestedAt: new Date(),
  }

  await pgdb.public.stripeCustomers.updateOne(
    { userId, companyId },
    {
      payload: { updateDefault, ...payload },
      updatedAt: new Date(),
    },
  )
}

/**
 * Find and maybe set Stripe payment method ID to default.
 */
exports.maybeUpdateDefault = async (userId, addPaymentMethod, pgdb) => {
  debug('maybeUpdateDefault %o', { userId })

  const clients = await getStripeClients(pgdb)

  const customer = await pgdb.public.stripeCustomers.findOne(
    { userId },
    {
      orderBy: { updatedAt: 'DESC' },
      limit: 1,
    },
  )

  if (customer?.payload?.updateDefault) {
    const { updateDefault } = customer.payload

    const { paymentMethodId, requestedAt } = updateDefault
    if (
      new Date(requestedAt).getTime() >=
      new Date().getTime() - UPDATE_DEFAULT_TTL
    ) {
      debug('updateDefault', { userId, paymentMethodId, requestedAt })
      await addPaymentMethod({
        paymentMethodId,
        userId,
        makeDefault: true,
        pgdb,
        clients,
      })
    } else {
      debug('updateDefault expired', { paymentMethodId, requestedAt })
    }

    this.forgetUpdateDefault(userId, pgdb)
  }
}

/**
 * Forget which Stripe payment method ID should become default.
 */
exports.forgetUpdateDefault = async (customer, pgdb) => {
  debug('forgetUpdateDefault %o', { customer: customer.id })

  if (customer?.payload?.updateDefault) {
    const { id } = customer
    const { updateDefault, ...rest } = customer.payload

    await pgdb.public.stripeCustomers.updateOne(
      { id },
      {
        payload: rest,
        updatedAt: new Date(),
      },
    )
  }
}
