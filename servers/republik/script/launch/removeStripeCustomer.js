const getClients = require('../../modules/crowdfundings/lib/payments/stripe/clients')

module.exports = async ({
  userId,
  pgdb
}) => {
  const { accounts } = await getClients(pgdb)

  const customers = await pgdb.public.stripeCustomers.find({
    userId
  })

  for (let customer of customers) {
    const account = accounts.find(a => a.company.id === customer.companyId)
    await pgdb.public.stripeCustomers.deleteOne({
      userId,
      companyId: customer.companyId
    })
    await account.stripe.customers.del(customer.id)
  }
}
