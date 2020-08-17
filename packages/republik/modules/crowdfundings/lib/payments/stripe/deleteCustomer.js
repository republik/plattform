const getClients = require('./clients')

module.exports = async ({
  userId,
  pgdb
}) => {
  const { accounts } = await getClients(pgdb)

  const customers = await pgdb.public.stripeCustomers.find({
    userId
  })

  if (!customers.length) {
    return
  }

  for (let customer of customers) {
    const account = accounts.find(a => a.company.id === customer.companyId)
    if (account) {
      await account.stripe.customers.del(customer.id)
      await pgdb.public.stripeCustomers.deleteOne({
        id: customer.id
      })
    } else {
      console.warn(`stripe.deleteCustomer (userId: ${userId}): not able to find account for companyId: ${customer.companyId}`)
    }
  }
}
