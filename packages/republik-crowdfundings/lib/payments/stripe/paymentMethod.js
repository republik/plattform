const getStripeClients = require('./clients')
const Promise = require('bluebird')

const getPaymentMethods = async (userId, pgdb) => {
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

  const [stripeCustomer, paymentMethods] = await Promise.all([
    platform.stripe.customers.retrieve(customer.id),
    platform.stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    }),
  ])
  if (!stripeCustomer || !paymentMethods) {
    return []
  }

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    isDefault:
      pm.id === stripeCustomer.invoice_settings?.default_payment_method,
    card: {
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    },
  }))
}

exports.getPaymentMethods = getPaymentMethods

exports.getDefaultPaymentMethod = async (userId, pgdb) => {
  const paymentMethods = await getPaymentMethods(userId, pgdb)
  return paymentMethods.find((pm) => pm.isDefault)
}
