const getClients = require('./clients')
const Promise = require('bluebird')
const debug = require('debug')('crowdfundings:stripe:merge')

const createMoveStripeCustomers = (pgdb) => async (fromUserId, toUserId) => {
  await pgdb.public.stripeCustomers.delete(
    { userId: toUserId }
  )
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
  const moveStripeCustomers = createMoveStripeCustomers(pgdb)

  const [targetStripeCustomers, sourceStripeCustomers] = await Promise.all([
    pgdb.public.stripeCustomers.find({
      userId: targetUserId
    }),
    pgdb.public.stripeCustomers.find({
      userId: sourceUserId
    })
  ])

  if (!sourceStripeCustomers.length) {
    debug('source has no stripCustomers, done')
    return
  }

  if (!targetStripeCustomers.length) {
    debug('target has no stripe customers, move source to target')
    return moveStripeCustomers(sourceUserId, targetUserId)
  }

  const getCustomers = (stripeCustomers) => Promise.map(stripeCustomers, (stripeCustomer) => {
    const account = accounts.find(a => a.company.id === stripeCustomer.companyId)
    return account.stripe.customers.retrieve(stripeCustomer.id)
  })

  const [targetCustomers, sourceCustomers] = await Promise.all([
    getCustomers(targetStripeCustomers),
    getCustomers(sourceStripeCustomers)
  ])

  // check subscriptions
  const hasSubscriptions = (customers) => customers
    .findIndex( c => c.subscriptions.data.length && c.subscriptions.data.filter(s => ['active', 'past_due'].includes(s.status)).length ) > -1

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
  const getSources = (customers) => customers.reduce( (acc, cur) => acc.concat(
    ...cur.default_source
      ? cur.sources.data.filter(s => s.id === cur.default_source)
      : cur.sources.data
  ), [])
  const getMaxSourcesExp = (customers) =>
    getSources(customers).reduce( (acc, cur) => Math.max(parseInt(`${cur.card.exp_year}${cur.card.exp_month}`), acc), 0)

  if (getSources(targetCustomers).length && getSources(sourceCustomers).length) {
    debug('target and source have sources')
    const targetMaxExp = getMaxSourcesExp(targetCustomers)
    const sourceMaxExp = getMaxSourcesExp(sourceCustomers)
    if (sourceMaxExp > targetMaxExp) {
      debug('source\'s card expires after target\'s, move source to target')
      return moveStripeCustomers(sourceUserId, targetUserId)
    }
  }

  debug('source is as good as target, doing nothing')
}
