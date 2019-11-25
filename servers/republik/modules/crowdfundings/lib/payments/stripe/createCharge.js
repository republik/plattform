const getClients = require('./clients')
const crypto = require('crypto')
const { descending } = require('d3-array')

module.exports = async ({
  amount,
  userId,
  companyId,
  sourceId, // optional - if empty, default_source is used
  fingerprint, // optional - if empty, default_source is used
  threeDSecure = false,
  pgdb
}) => {
  const { accounts } = await getClients(pgdb)

  const account = accounts.find(a => a.company.id === companyId)
  if (!account) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  const customer = await pgdb.public.stripeCustomers.findOne({
    userId,
    companyId
  })
  if (!customer) {
    throw new Error(`could not find stripeCustomer for userId: ${userId} companyId: ${companyId}`)
  }

  if (sourceId || fingerprint) {
    let _sourceId
    // in case of 3D secure, we have to use the special source directly.
    // It's card source was attached to the customer ind payPledge
    if (threeDSecure) {
      _sourceId = sourceId
    } else { // find this source on customer
      const stripeCustomer = await account.stripe.customers.retrieve(
        customer.id
      )

      const originalSourceChecksum = sourceId && crypto
        .createHash('sha1')
        .update(sourceId)
        .digest('hex')

      if (stripeCustomer.deleted) {
        throw new Error('createCharge found a deleted user')
      }

      const source = stripeCustomer.sources.data.sort((a, b) => descending(a.created, b.created)).find(s =>
        s.id === sourceId ||
        (s.card && s.card.fingerprint === fingerprint) ||
        (s.metadata && s.metadata.original_source_checksum &&
          s.metadata.original_source_checksum === originalSourceChecksum)
      )
      if (!source) {
        throw new Error('createCharge did not find specified source')
      }
      _sourceId = source.id
    }

    return account.stripe.charges.create({
      amount,
      currency: 'chf',
      customer: customer.id,
      source: _sourceId
    })
  } else {
    return account.stripe.charges.create({
      amount,
      currency: 'chf',
      customer: customer.id
    })
  }
}
