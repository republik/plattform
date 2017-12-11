const getClients = require('./clients')
const crypto = require('crypto')

module.exports = async ({
  amount,
  userId,
  companyId,
  sourceId, // optional - if empty default_source is used
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

  if (sourceId) { // find this source on customer
    const stripeCustomer = await account.stripe.customers.retrieve(
      customer.id
    )

    const originalSourceChecksum = crypto
      .createHash('sha1')
      .update(sourceId)
      .digest('hex')

    const source = stripeCustomer.sources.data.find(s =>
      s.id === sourceId ||
      (s.metadata && s.metadata.original_source_checksum &&
        s.metadata.original_source_checksum === originalSourceChecksum)
    )
    if (!source) {
      throw new Error('createCharge did not find specified source')
    }

    return account.stripe.charges.create({
      amount,
      currency: 'chf',
      customer: customer.id,
      source: source.id
    })
  } else {
    return account.stripe.charges.create({
      amount,
      currency: 'chf',
      customer: customer.id
    })
  }
}
