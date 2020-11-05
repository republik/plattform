const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const getClients = require('../../../lib/payments/stripe/clients')
const createCustomer = require('../../../lib/payments/stripe/createCustomer')
const addPaymentMethod = require('../../../lib/payments/stripe/addPaymentMethod')
const {
  getPaymentMethodForCompany,
} = require('../../../lib/payments/stripe/paymentMethod')

module.exports = async (
  _,
  { stripePlatformPaymentMethodId, companyId },
  { pgdb, req, user: me, t },
) => {
  ensureSignedIn(req)
  const userId = me.id

  const clients = await getClients(pgdb)

  // save paymentMethodId (to platform and connectedAccounts)
  if (
    !(await pgdb.public.stripeCustomers.findFirst({
      userId,
    }))
  ) {
    await createCustomer({
      paymentMethodId: stripePlatformPaymentMethodId,
      userId,
      pgdb,
      clients,
    })
  } else {
    await addPaymentMethod({
      paymentMethodId: stripePlatformPaymentMethodId,
      userId,
      pgdb,
      clients,
      makeDefault: true,
    })
  }

  // get paymentMethodId for companyId
  const paymentMethodId = await getPaymentMethodForCompany({
    userId,
    companyId,
    platformPaymentMethodId: stripePlatformPaymentMethodId,
    pgdb,
    clients,
    t,
  }).then((pm) => pm.id)

  // get customer for companyId
  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId,
  })
  if (!customer) {
    throw new Error(
      `could not find stripeCustomers for userId: ${userId} and companyId: ${companyId}`,
    )
  }

  // get stripe client for companyId
  const { stripe } = clients.accountForCompanyId(companyId)
  if (!stripe) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method: paymentMethodId,
    usage: 'off_session',
  })

  return {
    stripeClientSecret: setupIntent.client_secret,
  }
}
