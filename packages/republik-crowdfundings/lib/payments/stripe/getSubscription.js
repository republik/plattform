const getClients = require('./clients')

module.exports = async ({
  id,
  companyId,
  pgdb
}) => {
  const { accounts } = await getClients(pgdb)

  const account = accounts.find(a => a.company.id === companyId)
  if (!account) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  return account.stripe.subscriptions.retrieve(id)
}
