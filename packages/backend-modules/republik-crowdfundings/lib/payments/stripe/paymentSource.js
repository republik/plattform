const getStripeClients = require('./clients')

const CACHE_KEY = 'paymentSources'

/**
 * Maps legacy Card.brand to PaymentMethod.card.brand
 * - "American Express" to "amex"
 * - "Diners Club" to "diners"
 * - any brand to lower case string
 *
 *
 * @see https://stripe.com/docs/api/cards/object#card_object-brand
 * @see https://stripe.com/docs/api/payment_methods/object#payment_method_object-card
 *
 * @param {string} brand
 * @returns {string}
 */
function mapCardBrand(brand) {
  switch (brand) {
    case 'American Express':
      return 'amex'
    case 'Diners Club':
      return 'diners'
    default:
      return brand.toLowerCase()
  }
}

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
    brand: mapCardBrand(source.card.brand),
    wallet: source.card.wallet.type,
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
