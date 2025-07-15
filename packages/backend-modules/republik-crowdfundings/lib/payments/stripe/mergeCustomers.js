const getClients = require('./clients')
const Promise = require('bluebird')
const debug = require('debug')('crowdfundings:stripe:merge')
const { getDefaultPaymentMethod } = require('./paymentMethod')

const createMoveStripeCustomersInDb =
  (pgdb) => async (fromUserId, toUserId) => {
    await pgdb.public.stripeCustomers.delete({ userId: toUserId })
    await pgdb.payments.stripeCustomers.delete({ userId: toUserId })
    await pgdb.payments.stripeCustomers.update(
      { userId: fromUserId },
      {
        userId: toUserId,
        updatedAt: new Date(),
      },
    )
    return pgdb.public.stripeCustomers.update(
      { userId: fromUserId },
      {
        userId: toUserId,
        updatedAt: new Date(),
      },
    )
  }

const createMoveStripeCustomersOnStripe =
  (accounts) =>
  async ({ targetUser, associatedCustomers, oldCustomers }) => {
    // update email and userId on stripe customer that should be associated with the target user
    await Promise.map(associatedCustomers, async (stripeCustomer) => {
      const account = accounts.find(
        (a) => a.company.id === stripeCustomer.companyId,
      )
      await account.stripe.customers.update(stripeCustomer.id, {
        name: targetUser.email,
        email: targetUser.email,
        metadata: {
          userId: targetUser.id,
        },
      })
    })
    // delete now unused stripe customer
    return Promise.map(oldCustomers, async (stripeCustomer) => {
      const account = accounts.find(
        (a) => a.company.id === stripeCustomer.companyId,
      )
      return account.stripe.customers.del(stripeCustomer.id)
    })
  }

module.exports = async ({
  targetUser,
  sourceUser,
  pgdb,
  clients, // optional
}) => {
  const { accounts } = clients || (await getClients(pgdb))
  const moveStripeCustomers = createMoveStripeCustomersInDb(pgdb)
  const associateStripeCustomerWithTargetUser =
    createMoveStripeCustomersOnStripe(accounts)

  const [targetStripeCustomers, sourceStripeCustomers] = await Promise.all([
    pgdb.public.stripeCustomers.find({
      userId: targetUser.id,
    }),
    pgdb.public.stripeCustomers.find({
      userId: sourceUser.id,
    }),
  ])

  if (!sourceStripeCustomers.length) {
    debug('source has no stripCustomers, done')
    return
  }

  if (!targetStripeCustomers.length) {
    debug('target has no stripe customers, move source to target')
    await associateStripeCustomerWithTargetUser({
      targetUser: targetUser,
      associatedCustomers: sourceStripeCustomers,
      oldCustomers: targetStripeCustomers,
    })
    return moveStripeCustomers(sourceUser.id, targetUser.id)
  }

  const getCustomers = (stripeCustomers) =>
    Promise.map(stripeCustomers, (stripeCustomer) => {
      const account = accounts.find(
        (a) => a.company.id === stripeCustomer.companyId,
      )
      return account.stripe.customers.retrieve(stripeCustomer.id, {
        expand: ['subscriptions', 'sources'],
      })
    })

  const [targetCustomers, sourceCustomers] = await Promise.all([
    getCustomers(targetStripeCustomers),
    getCustomers(sourceStripeCustomers),
  ])


  // check subscriptions
  const hasSubscriptions = (customers) =>
    customers.some(
      (c) =>
        c.subscriptions?.data?.some((s) =>
          ['active', 'past_due', 'unpaid', 'paused'].includes(s.status),
        ),
    )

  if (hasSubscriptions(targetCustomers) && hasSubscriptions(sourceCustomers)) {
    debug('target and source have subscriptions, abort')
    throw new Error(
      'stripe customers cannot be merged as both have active subscriptions',
    )
  }

  if (hasSubscriptions(targetCustomers)) {
    debug('only target has subscriptions, done')
    await associateStripeCustomerWithTargetUser({
      targetUser: targetUser,
      associatedCustomers: targetStripeCustomers,
      oldCustomers: sourceStripeCustomers,
    })
    return
  }

  if (hasSubscriptions(sourceCustomers)) {
    debug('only source has subscriptions, move source to target')
    await associateStripeCustomerWithTargetUser({
      targetUser: targetUser,
      associatedCustomers: sourceStripeCustomers,
      oldCustomers: targetStripeCustomers,
    })
    return moveStripeCustomers(sourceUser.id, targetUser.id)
  }

  // check paymentMethods
  const getDefaultPaymentMethods = async (customers) =>
    Promise.map(customers, (cus) =>
      getDefaultPaymentMethod({
        userId: cus.userId,
        pgdb,
        clients,
      }),
    ).then((a) => a.filter(Boolean))

  const getPaymentMethodExp = (pm) =>
    parseInt(`${pm.card.expYear}${pm.card.expMonth}`)

  const sourcePMs = await getDefaultPaymentMethods(sourceStripeCustomers)
  const targetPMs = await getDefaultPaymentMethods(targetStripeCustomers)
  if (sourcePMs.length) {
    if (!targetPMs.length) {
      debug('source has paymentSources, target not, move source to target')
      await associateStripeCustomerWithTargetUser({
        targetUser: targetUser,
        associatedCustomers: sourceStripeCustomers,
        oldCustomers: targetStripeCustomers,
      })
      return moveStripeCustomers(sourceUser.id, targetUser.id)
    }
    // both have paymentMethods
    if (getPaymentMethodExp(sourcePMs[0]) > getPaymentMethodExp(targetPMs[0])) {
      debug("source's PM card expires after target's, move source to target")
      await associateStripeCustomerWithTargetUser({
        targetUser: targetUser,
        associatedCustomers: sourceStripeCustomers,
        oldCustomers: targetStripeCustomers,
      })
      return moveStripeCustomers(sourceUser.id, targetUser.id)
    }
  }

  // check sources
  const getSources = (customers) =>
    customers.reduce(
      (acc, cur) =>
        acc.concat(
          ...(cur.default_source
            ? cur.sources.data.filter((s) => s.id === cur.default_source)
            : cur.sources.data),
        ),
      [],
    )
  const getMaxSourcesExp = (customers) =>
    getSources(customers).reduce(
      (acc, cur) =>
        Math.max(parseInt(`${cur.card.exp_year}${cur.card.exp_month}`), acc),
      0,
    )

  if (
    getSources(targetCustomers).length &&
    getSources(sourceCustomers).length
  ) {
    debug('target and source have sources')
    const targetMaxExp = getMaxSourcesExp(targetCustomers)
    const sourceMaxExp = getMaxSourcesExp(sourceCustomers)
    if (sourceMaxExp > targetMaxExp) {
      debug("source's card expires after target's, move source to target")
      await associateStripeCustomerWithTargetUser({
        targetUser: targetUser,
        associatedCustomers: sourceStripeCustomers,
        oldCustomers: targetStripeCustomers,
      })
      return moveStripeCustomers(sourceUser.id, targetUser.id)
    }
  }

  debug(
    'source is as good as target, target stripe customer is already up to date',
  )
  await associateStripeCustomerWithTargetUser({
    targetUser: targetUser,
    associatedCustomers: targetStripeCustomers,
    oldCustomers: sourceStripeCustomers,
  })
}
