const getClients = require('./clients')
const addSource = require('./addSource')

// this method doesn't check if the user has a stripe customer already
module.exports = async ({
  sourceId,
  userId,
  pgdb,
  clients // optional
}) => {
  const {
    provider,
    connectedAccounts
  } = clients || await getClients(pgdb)

  const user = await pgdb.public.users.findOne({
    id: userId
  })

  const customer = await provider.stripe.customers.create({
    email: user.email
  })

  await pgdb.public.stripeCustomers.insert({
    id: customer.id,
    userId,
    companyId: provider.company.id
  })

  for (let connectedAccount of connectedAccounts) {
    const connectedCustomer = await connectedAccount.stripe.customers.create({
      email: user.email
    })

    await pgdb.public.stripeCustomers.insert({
      id: connectedCustomer.id,
      userId,
      companyId: connectedAccount.company.id
    })
  }

  await addSource({
    sourceId,
    userId,
    pgdb,
    clients
  })
}
