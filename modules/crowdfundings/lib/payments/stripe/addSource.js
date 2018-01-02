const getClients = require('./clients')
const crypto = require('crypto')

module.exports = async ({
  sourceId,
  userId,
  pgdb,
  clients, // optional
  deduplicate = false,
  makeDefault = false,
  t
}) => {
  const {
    platform,
    connectedAccounts
  } = clients || await getClients(pgdb)

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId: platform.company.id
  })
  if (!customer) {
    throw new Error(`could not find stripeCustomer for userId: ${userId} companyId: ${platform.company.id}`)
  }

  if (deduplicate) {
    const source = await platform.stripe.sources.retrieve(sourceId)
    const stripeCustomer = await platform.stripe.customers.retrieve(customer.id)

    // see _mutations/addPaymentSource
    if (source.type === 'three_d_secure') {
      throw new Error('three_d_secure sources cannot be attached like this!')
    }

    const existingSource = stripeCustomer.sources.data.find(s =>
      s.card && s.card.fingerprint === source.card.fingerprint
    )
    if (existingSource) {
      return existingSource.id
    }
  }

  await platform.stripe.customers.createSource(customer.id, {
    source: sourceId
  })
  if (makeDefault) {
    await platform.stripe.customers.update(customer.id, {
      default_source: sourceId
    })
  }

  for (let connectedAccount of connectedAccounts) {
    const connectedCustomer = await pgdb.public.stripeCustomers.findOne({
      userId,
      companyId: connectedAccount.company.id
    })
    if (!connectedCustomer) {
      throw new Error(`could not find stripeCustomer for userId: ${userId} companyId: ${connectedAccount.company.id}`)
    }

    const connectedSource = await platform.stripe.sources.create({
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

    await platform.stripe.customers.createSource(connectedCustomer.id, {
      source: connectedSource.id,
      validate: false // workaround suggested by stripe suppor for 402 invalid_cvc
    }, {
      stripe_account: connectedAccount.accountId
    })
    if (makeDefault) {
      await platform.stripe.customers.update(connectedCustomer.id, {
        default_source: connectedSource.id
      }, {
        stripe_account: connectedAccount.accountId
      })
    }
  }

  return sourceId
}
