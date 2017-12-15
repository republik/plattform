const getClients = require('./clients')

module.exports = async ({
  plan,
  userId,
  companyId,
  metadata,
  pgdb
}) => {
  const { accounts } = await getClients(pgdb)

  const account = accounts.find(a => a.company.id === companyId)
  if (!account) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId
  })
  if (!customer) {
    throw new Error(`could not find stripeCustomer for userId: ${userId} companyId: ${companyId}`)
  }

  return account.stripe.subscriptions.create({
    customer: customer.id,
    items: [
      { plan }
    ],
    metadata
  })
}
