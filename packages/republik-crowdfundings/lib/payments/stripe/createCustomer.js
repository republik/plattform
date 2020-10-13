const getClients = require('./clients')
const addSource = require('./addSource')
const addPaymentMethod = require('./addPaymentMethod')

// this method doesn't check if the user has a stripe customer already
module.exports = async ({
  sourceId,
  paymentMethodId,
  userId,
  pgdb,
  clients, // optional
}) => {
  const { platform, connectedAccounts } = clients || (await getClients(pgdb))

  const user = await pgdb.public.users.findOne({
    id: userId,
  })

  const customer = await platform.stripe.customers.create({
    email: user.email,
    metadata: {
      userId,
    },
  })

  await pgdb.public.stripeCustomers.insert({
    id: customer.id,
    userId,
    companyId: platform.company.id,
  })

  for (const connectedAccount of connectedAccounts) {
    const connectedCustomer = await connectedAccount.stripe.customers.create({
      email: user.email,
      metadata: {
        userId,
      },
    })

    await pgdb.public.stripeCustomers.insert({
      id: connectedCustomer.id,
      userId,
      companyId: connectedAccount.company.id,
    })
  }

  if (sourceId) {
    await addSource({
      sourceId,
      userId,
      pgdb,
      clients,
    })
  } else if (paymentMethodId) {
    await addPaymentMethod({
      paymentMethodId,
      userId,
      pgdb,
      clients,
      makeDefault: true,
    })
  }
}
