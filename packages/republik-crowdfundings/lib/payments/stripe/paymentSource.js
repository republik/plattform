const getStripeClients = require('./clients')

const getPaymentSources = async (userId, pgdb) => {
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
  return stripeCustomer.sources.data.map((source) => ({
    id: source.id,
    isDefault: source.id === stripeCustomer.default_source,
    status: source.status.toUpperCase(),
    brand: source.card.brand,
    last4: source.card.last4,
    expMonth: source.card.exp_month,
    expYear: source.card.exp_year,
  }))
}

exports.getPaymentSources = getPaymentSources

exports.getDefaultPaymentSource = async (userId, pgdb) => {
  const paymentSources = await getPaymentSources(userId, pgdb)
  return paymentSources.find((s) => s.isDefault)
}
