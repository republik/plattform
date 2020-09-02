const getStripeClients = require('./payments/stripe/clients')

const getPaymentSources = async (user, pgdb) => {
  const { platform } = await getStripeClients(pgdb)
  if (!platform) {
    return []
  }
  const customer = await pgdb.public.stripeCustomers.findOne({
    userId: user.id,
    companyId: platform.company.id
  })
  if (!customer) {
    return []
  }
  const stripeCustomer = await platform.stripe.customers.retrieve(customer.id)
  if (!stripeCustomer || !stripeCustomer.sources || !stripeCustomer.sources.data) {
    return []
  }
  return stripeCustomer.sources.data.map(source => ({
    id: source.id,
    isDefault: source.id === stripeCustomer.default_source,
    status: source.status.toUpperCase(),
    brand: source.card.brand,
    last4: source.card.last4,
    expMonth: source.card.exp_month,
    expYear: source.card.exp_year
  }))
}

exports.getPaymentSources = getPaymentSources
exports.getDefaultPaymentSource = (user, pgdb) => getPaymentSources(user, pgdb)
  .then(
    paymentSources => paymentSources.find(
      s => s.isDefault
    )
  )
