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

  let existingSource
  if (deduplicate) {
    const source = await platform.stripe.sources.retrieve(sourceId)
    const stripeCustomer = await platform.stripe.customers.retrieve(customer.id)

    // see _mutations/addPaymentSource
    if (source.type === 'three_d_secure') {
      throw new Error('three_d_secure sources cannot be attached like this!')
    }

    existingSource = stripeCustomer.sources.data.find(s =>
      s.card && s.card.fingerprint === source.card.fingerprint
    )
    if (existingSource && makeDefault === false) {
      return existingSource.id
    }
  }

  if (!existingSource) {
    await platform.stripe.customers.createSource(customer.id, {
      source: sourceId
    })
  }
  if (makeDefault) {
    await platform.stripe.customers.update(customer.id, {
      default_source: existingSource.id || sourceId
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

    const originalSourceChecksum = crypto
      .createHash('sha1')
      .update(sourceId)
      .digest('hex')

    let connectedSource
    if (existingSource) {
      const connectedCustomerStripe = await connectedAccount.stripe.customers.retrieve(
        connectedCustomer.id
      )
      connectedSource = connectedCustomerStripe.sources.data.find(s =>
        (s.metadata && s.metadata.original_source_checksum &&
          s.metadata.original_source_checksum === originalSourceChecksum)
      )
      if (!connectedSource) {
        throw new Error('could not find source for connectedCustomerStripe with existingSource')
      }
    } else {
      connectedSource = await platform.stripe.sources.create({
        customer: customer.id,
        usage: 'reusable',
        original_source: sourceId,
        metadata: {
          original_source_checksum: originalSourceChecksum
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
    }

    if (makeDefault) {
      await platform.stripe.customers.update(connectedCustomer.id, {
        default_source: connectedSource.id
      }, {
        stripe_account: connectedAccount.accountId
      })
    }
  }

  if (existingSource) {
    return existingSource.id
  }

  return sourceId
}
