const getClients = require('./clients')

module.exports = async ({ id, item_id, companyId, pgdb }) => {
  const { accounts } = await getClients(pgdb)

  const account = accounts.find((a) => a.company.id === companyId)
  if (!account) {
    throw new Error(`could not find account for companyId: ${companyId}`)
  }

  // https://stripe.com/docs/billing/subscriptions/cancel#reactivating-canceled-subscriptions
  return account.stripe.subscriptions.update(id, {
    cancel_at_period_end: false,
    items: [{ id: item_id }],
  })
}
