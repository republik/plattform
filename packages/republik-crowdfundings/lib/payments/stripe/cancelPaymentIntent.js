const getStripeClients = require('./clients')

module.exports = async ({
  paymentIntentId,
  companyId,
  pgdb,
  clients, // optional
}) => {
  const { accounts } = clients || (await getStripeClients(pgdb))

  const { stripe } = accounts.find((a) => a.company.id === companyId)
  if (!stripe) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  return stripe.paymentIntents.cancel(paymentIntentId)
}
