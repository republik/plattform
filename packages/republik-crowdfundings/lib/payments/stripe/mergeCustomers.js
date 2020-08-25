const getClients = require('./clients')
const Promise = require('bluebird')
const debug = require('debug')('crowdfundings:stripe:merge')

const moveStripeCustomers = (fromUserId, toUserId) => {
  return pgdb.public.stripeCustomers.update(
    { userId: fromUserId },
    {
      userId: toUserId,
      updatedAt: new Date()
    }
  )
}

module.exports = async ({
  targetUserId,
  sourceUserId,
  pgdb,
  clients // optional
}) => {
  const {
    accounts
  } = clients || await getClients(pgdb)

  const [targetStripeCustomers, sourceStripeCustomers] = await Promise.all([
    pgdb.public.stripeCustomers.find({
      userId: targetUserId
    }),
    pgdb.public.stripeCustomers.find({
      userId: sourceUserId
    })
  ])

  if (!sourceStripeCustomer.length) {
    debug('source has no stripCustomers, done')
    return
  }

  if (!targetStripeCustomer.length) {
    debug('target has no stripe customers, move source to target')
    return moveStripeCustomers(sourceUserId, targetUserId)
  }

  const getCustomers = (stripeCustomers) => Promise.map(stripeCustomers, (stripeCustomer) => {
    const account = accounts.find(a => a.company.id === stripeCustomer.companyId)
    return account.stripe.customers.retrieve(stripeCustomer.id)
  })

  const [targetCustomers, sourceCustomers] = await Promise.all([
    getCustomers(targetCustomers),
    getCustomers(sourceCustomers)
  ])

  // check subscriptions
  // TODO: check status
  // https://stripe.com/docs/api/subscriptions/object?lang=node
  const hasSubscriptions = (customers) => customers.findIndex( c => c.subscriptions.data.length ) > -1

  if (hasSubscriptions(targetCustomers) && hasSubscriptions(sourceCustomers)) {
    debug('target and source have subscriptions, abort')
    throw new Error('stripe customers cannot be merged as both have subscriptions')
  }

  if (hasSubscriptions(targetCustomers)) {
    debug('only target has subscriptions, done')
    return
  }

  if (hasSubscriptions(sourceCustomers)) {
    debug('only source has subscriptions, move source to target')
    return moveStripeCustomers(sourceUserId, targetUserId)
  }

  // check sources
  const getSources = (customers) =>
    customers.reduce( (acc, cur) => acc.concat(...cur.sources.data), [])
  const getMaxSourcesExpYear = (customers) =>
    getSources(customers).reduce( (acc, cur) => Math.max(cur.card.exp_year, acc), 0)

  if (getSources(targetCustomers).length && getSources(sourceCustomers).length) {
    debug('target and source have sources')
    const targetMaxExpYear = getMaxSourcesExpYear(targetCustomers)
    const sourceMaxExpYear = getMaxSourcesExpYear(sourceCustomers)
    if (sourceMaxExpYear > targetMaxExpYear) {
      debug('source cards expire after target\'s, move source to target')
      return moveStripeCustomers(sourceUserId, targetUserId)
    }
  }

  debug('source is as good as target, doing nothing')
}
