const _ = {
  difference: require('lodash/difference')
}
const {
  STRIPE_PROVIDER,
  STRIPE_CONNECTED_ACCOUNTS
} = process.env

module.exports = async (pgdb) => {
  const accountNames = [
    STRIPE_PROVIDER,
    ...STRIPE_CONNECTED_ACCOUNTS.split(',')
  ]

  const companies = await pgdb.public.companies.find({
    name: accountNames
  })
  if (companies.length < accountNames) {
    const missing = _.difference(accountNames, companies.map(c => c.name))
    throw new Error(`missing company for stripe account: ${missing.join(',')}`)
  }

  const accounts = accountNames
    .map(accountName => {
      const key = process.env[`STRIPE_SECRET_KEY_${accountName}`]
      if (!key) {
        throw new Error(`missing STRIPE_SECRET_KEY_${accountName}`)
      }
      const accountId = process.env[`STRIPE_ACCOUNT_ID_${accountName}`]
      if (!accountId) {
        throw new Error(`missing STRIPE_ACCOUNT_ID_${accountName}`)
      }
      const company = companies.find(c => c.name === accountName)
      return {
        name: accountName,
        stripe: require('stripe')(key),
        accountId,
        company
      }
    })

  return {
    provider: accounts.find(a => a.name === STRIPE_PROVIDER),
    connectedAccounts: accounts.filter(a => a.name !== STRIPE_PROVIDER),
    accounts
  }
}
