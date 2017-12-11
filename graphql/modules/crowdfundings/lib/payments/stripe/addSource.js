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

  // see problem description below
  // as long as we can't add source on the connected account
  // we can also not do it for the provider (deduplication would fail)
  // await provider.stripe.customers.createSource(customer.id, {
  //  source: sourceId
  // })
  await provider.stripe.customers.update(customer.id, {
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

    // this should work but doesn't. stripe throws the following strange error
    // 402 type: 'StripeCardError', code: 'invalid_cvc',
    // until we get feedback from stripe we have no other choice than to replace
    // the card on the connected accounts customer
    // await connectedAccount.stripe.customers.createSource(connectedCustomer.id, {
    //  source: connectedSource.id
    // })
    await connectedAccount.stripe.customers.update(connectedCustomer.id, {
      source: connectedSource.id
    })
  }
}
