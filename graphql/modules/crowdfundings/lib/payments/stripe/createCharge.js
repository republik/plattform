const getClients = require('./clients')

// this method doesn't check if the user has a stripe customer already
module.exports = async ({
  amount,
  userId,
  companyId,
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

  return account.stripe.charges.create({
    amount,
    currency: 'chf',
    customer: customer.id
  })
}
