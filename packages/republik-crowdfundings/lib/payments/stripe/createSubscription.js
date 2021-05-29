const debug = require('debug')(
  'crowdfundings:lib:payments:stripe:createSubscription',
)

const getClients = require('./clients')
const { getPaymentMethodForCompany } = require('./paymentMethod')

module.exports = async ({
  plan,
  userId,
  companyId,
  platformPaymentMethodId, // optional
  metadata,
  pgdb,
  clients: _clients, // optional
  t,
}) => {
  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId,
  })
  if (!customer) {
    console.error(
      `could not find stripeCustomer for userId: ${userId} companyId: ${companyId}`,
    )
    throw new Error(t('api/unexpected'))
  }

  const clients = _clients || (await getClients(pgdb))
  const { stripe } = clients.accountForCompanyId(companyId)

  if (!platformPaymentMethodId) {
    debug('subscribe user with default payment method %o', {
      customer: customer.id,
    })
    return stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan }],
      metadata,
      expand: ['latest_invoice', 'latest_invoice.payment_intent'],
    })
  }

  const paymentMethodId = await getPaymentMethodForCompany({
    userId,
    companyId,
    platformPaymentMethodId,
    pgdb,
    clients,
    t,
  }).then((pm) => pm.id)

  debug('subscribe with payment method %o', { paymentMethodId })
  return stripe.subscriptions.create({
    customer: customer.id,
    default_payment_method: paymentMethodId,
    items: [{ plan }],
    metadata,
    expand: ['latest_invoice', 'latest_invoice.payment_intent'],
  })
}
