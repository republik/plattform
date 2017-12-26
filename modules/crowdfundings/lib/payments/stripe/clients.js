const _ = {
  difference: require('lodash/difference')
}
const {
  STRIPE_PLATFORM,
  STRIPE_CONNECTED_ACCOUNTS
} = process.env

module.exports = async (pgdb) => {
  const accountNames = [
    STRIPE_PLATFORM,
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

      const endpointSecretKey = accountName === STRIPE_PLATFORM
        ? 'STRIPE_PLATFORM_ENDPOINT_SECRET'
        : 'STRIPE_CONNECTED_ENDPOINT_SECRET'
      const endpointSecret = process.env[endpointSecretKey]
      if (!endpointSecretKey) {
        throw new Error(`missing ${endpointSecretKey}`)
      }

      const company = companies.find(c => c.name === accountName)
      return {
        name: accountName,
        stripe: require('stripe')(key),
        accountId,
        endpointSecret,
        company
      }
    })

  return {
    platform: accounts.find(a => a.name === STRIPE_PLATFORM),
    connectedAccounts: accounts.filter(a => a.name !== STRIPE_PLATFORM),
    accounts
  }
}
