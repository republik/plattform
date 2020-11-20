const getStripeClients = require('./clients')

const CACHE_KEY = 'paymentSources'

const getPaymentSources = async (userId, pgdb, acceptCachedData = false) => {
  const { platform } = await getStripeClients(pgdb)
  if (!platform) {
    return []
  }

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId: platform.company.id,
  })
  if (!customer) {
    return []
  }

  if (acceptCachedData && customer.cache?.[CACHE_KEY]) {
    return customer.cache[CACHE_KEY]
  }

  const stripeCustomer = await platform.stripe.customers.retrieve(customer.id, {
    expand: ['sources'],
  })
  if (
    !stripeCustomer ||
    !stripeCustomer.sources ||
    !stripeCustomer.sources.data
  ) {
    return []
  }

  const result = stripeCustomer.sources.data.map((source) => ({
    id: source.id,
    isDefault: source.id === stripeCustomer.default_source,
    status: source.status.toUpperCase(),
    brand: source.card.brand,
    last4: source.card.last4,
    expMonth: source.card.exp_month,
    expYear: source.card.exp_year,
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

exports.getPaymentSources = getPaymentSources

exports.getDefaultPaymentSource = async (userId, pgdb, acceptCachedData) => {
  const paymentSources = await getPaymentSources(userId, pgdb, acceptCachedData)
  return paymentSources.find((s) => s.isDefault)
}
