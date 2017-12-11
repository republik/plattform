const getClients = require('./clients')

// this method doesn't check if the user has a stripe customer already
module.exports = async ({
  sourceId,
  userId,
  pgdb
}) => {
  const {
    provider,
    connectedAccounts
  } = await getClients(pgdb)

  const user = await pgdb.public.users.findOne({
    id: userId
  })

  const customer = await provider.stripe.customers.create({
    email: user.email,
    source: sourceId
  })

  await pgdb.public.stripeCustomers.insert({
    id: customer.id,
    userId,
    companyId: provider.company.id
  })

  for (let connectedAccount of connectedAccounts) {
    const connectedSource = await provider.stripe.sources.create({
      customer: customer.id,
      usage: 'reusable',
      original_source: sourceId
    }, {
      stripe_account: connectedAccount.accountId
    })

    const connectedCustomer = await connectedAccount.stripe.customers.create({
      email: user.email,
      source: connectedSource.id
    })

    await pgdb.public.stripeCustomers.insert({
      id: connectedCustomer.id,
      userId,
      companyId: connectedAccount.company.id
    })
  }
}
