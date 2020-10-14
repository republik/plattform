const getStripeClients = require('./clients')
const Promise = require('bluebird')

const getPaymentMethods = async (userId, pgdb) => {
  const { platform, connectedAccounts } = await getStripeClients(pgdb)
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

  // add connected paymentMethods to paymentMethods.connectedPaymentMethods
  for (const connectedAccount of connectedAccounts) {
    const connectedCustomer = await pgdb.public.stripeCustomers.findOne({
      userId,
      companyId: connectedAccount.company.id,
    })
    if (!connectedCustomer) {
      throw new Error(
        `could not find stripeCustomer for userId: ${userId} companyId: ${connectedAccount.company.id}`,
      )
    }
    const connectedPaymentMethods = await platform.stripe.paymentMethods.list(
      {
        customer: connectedCustomer.id,
        type: 'card',
      },
      {
        stripeAccount: connectedAccount.accountId,
      },
    )
    for (const cpm of connectedPaymentMethods?.data) {
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
          companyId: connectedAccount.company.id,
        })
      }
    }
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
    companyId: platform.company.id,
    connectedPaymentMethods: pm.connectedPaymentMethods,
  }))
}

exports.getPaymentMethods = getPaymentMethods

exports.getDefaultPaymentMethod = async (userId, pgdb) => {
  const paymentMethods = await getPaymentMethods(userId, pgdb)
  return paymentMethods.find((pm) => pm.isDefault)
}
