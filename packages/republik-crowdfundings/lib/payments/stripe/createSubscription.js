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
  errIfIncomplete, // optional
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

  const subscription = {
    customer: customer.id,
    items: [{ plan }],
    metadata,
    expand: ['latest_invoice', 'latest_invoice.payment_intent'],
  }

  if (errIfIncomplete) {
    // If errIfIncomplete is false, a subscripton might be created but status
    // set to incomplete e.g. if payment_intent requires another payment
    // method or payment_intent requires action.
    //
    // "Use error_if_incomplete if you want Stripe to return an HTTP 402 status
    // code if a subscription’s first invoice cannot be paid. For example, if a
    // payment method requires 3DS authentication due to SCA regulation and
    // further user action is needed, this parameter does not create a
    // subscription and returns an error instead."
    //
    // @see https://stripe.com/docs/api/subscriptions/create#create_subscription-payment_behavior
    subscription.payment_behavior = 'error_if_incomplete'
  }

  if (!platformPaymentMethodId) {
    debug('subscribe user with default payment method %o', subscription)
    return stripe.subscriptions.create(subscription)
  }

  subscription.default_payment_method = await getPaymentMethodForCompany({
    userId,
    companyId,
    platformPaymentMethodId,
    pgdb,
    clients,
    t,
  }).then((pm) => pm.id)

  debug('subscribe with payment method %o', subscription)
  return stripe.subscriptions.create(subscription)
}
