const getClients = require('./clients')

module.exports = async ({
  userId,
  pgdb
}) => {
  const { accounts } = await getClients(pgdb)

  const customers = await pgdb.public.stripeCustomers.find({
    userId
  })

  return Promise.all(
    customers.map(customer => {
      const account = accounts.find(a => a.company.id === customer.companyId)
      if (account) {
        return account.stripe.customers.del(customer.id)
      } else {
        console.warn(`stripe.deleteCustomer (userId: ${userId}): not able to find account for companyId: ${customer.companyId}`)
      }
    })
  )
}
