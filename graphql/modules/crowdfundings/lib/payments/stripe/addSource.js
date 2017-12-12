const getClients = require('./clients')
const crypto = require('crypto')

module.exports = async ({
  sourceId,
  userId,
  pgdb,
  clients, // optional
  deduplicate = false
}) => {
  const {
    provider,
    connectedAccounts
  } = clients || await getClients(pgdb)

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId: provider.company.id
  })
  if (!customer) {
    throw new Error(`could not find stripeCustomer for userId: ${userId} companyId: ${provider.company.id}`)
  }

  if (deduplicate) {
    const source = await provider.stripe.sources.retrieve(sourceId)
    const stripeCustomer = await provider.stripe.customers.retrieve(customer.id)

    const existingSource = stripeCustomer.sources.data.find(s =>
      s.card && s.card.fingerprint === source.card.fingerprint
    )
    if (existingSource) {
      console.log('addSource detected card duplicate, not adding!')
      return
    }
  }

  await provider.stripe.customers.createSource(customer.id, {
    source: sourceId
  })

  for (let connectedAccount of connectedAccounts) {
    const connectedCustomer = await pgdb.public.stripeCustomers.findOne({
      userId,
      companyId: connectedAccount.company.id
    })
    if (!connectedCustomer) {
      throw new Error(`could not find stripeCustomer for userId: ${userId} companyId: ${connectedAccount.company.id}`)
    }

    const connectedSource = await provider.stripe.sources.create({
      customer: customer.id,
      usage: 'reusable',
      original_source: sourceId,
      metadata: {
        original_source_checksum: crypto
          .createHash('sha1')
          .update(sourceId)
          .digest('hex')
      }
    }, {
      stripe_account: connectedAccount.accountId
    })

    await provider.stripe.customers.createSource(connectedCustomer.id, {
      source: connectedSource.id,
      validate: false // workaround suggested by stripe suppor for 402 invalid_cvc
    }, {
      stripe_account: connectedAccount.accountId
    })
  }
}
