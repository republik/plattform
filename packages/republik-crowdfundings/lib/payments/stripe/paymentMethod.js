const getStripeClients = require('./clients')
const Promise = require('bluebird')

const getPaymentMethods = async ({
  userId,
  pgdb,
  clients, // optional
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

  const [
    stripeCustomer,
    paymentMethods,
    connectedAccountsPaymentMethods,
  ] = await Promise.all([
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

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    isDefault:
      pm.id === stripeCustomer.invoice_settings?.default_payment_method,
    // in contrast to sources, status is not available from stripe
    status: 'CHARGEABLE',
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

exports.getDefaultPaymentMethod = async ({
  userId,
  pgdb,
  clients, // optional
}) => {
  const paymentMethods = await getPaymentMethods({ userId, pgdb, clients })
  return paymentMethods.find((pm) => pm.isDefault)
}
