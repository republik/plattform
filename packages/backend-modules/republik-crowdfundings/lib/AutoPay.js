const debug = require('debug')('crowdfundings:lib:AutoPay')

const {
  applyPgInterval: { add: addInterval },
} = require('@orbiting/backend-modules-utils')

const createCharge = require('./payments/stripe/createCharge')
const { getPackages } = require('./User')
const { getLastEndDate } = require('./utils')
const createCache = require('./cache')

const { getDefaultPaymentSource } = require('./payments/stripe/paymentSource')

const { getDefaultPaymentMethod } = require('./payments/stripe/paymentMethod')
const createPaymentIntent = require('./payments/stripe/createPaymentIntent')
const Promise = require('bluebird')

const suggest = async (membershipId, pgdb) => {
  // Find membership
  const membership = await pgdb.public.memberships.findOne({ id: membershipId })

  if (!membership) {
    return false
  }

  // load a bunch of stuff we'r going to need later
  const [membershipPeriods, relatedPledgeOptions, membershipTypes] =
    await Promise.all([
      pgdb.public.membershipPeriods.find({
        membershipId: membership.id,
      }),
      pgdb.public.pledgeOptions.find({
        or: [{ membershipId }, { pledgeId: membership.pledgeId }],
      }),
      pgdb.public.membershipTypes.findAll(),
    ])

  if (relatedPledgeOptions.length < 1) {
    return false
  }

  // Find latest successful pledge
  const pledge = await pgdb.public.pledges.findOne(
    { id: relatedPledgeOptions.map((po) => po.pledgeId), status: 'SUCCESSFUL' },
    { orderBy: { createdAt: 'DESC' }, limit: 1 },
  )

  if (!pledge) {
    return false
  }

  // to get membership-related rewardId
  const membershipPackageOptions = await pgdb.public.packageOptions.find({
    rewardId: membershipTypes.map((mt) => mt.rewardId),
  })

  const pledgeOptions = (
    await pgdb.public.pledgeOptions.find({
      pledgeId: pledge.id,
      'amount >=': 1,
    })
  ).map((pledgeOption) => ({
    ...pledgeOption,
    packageOption: membershipPackageOptions.find(
      (po) => po.id === pledgeOption.templateId,
    ),
  }))

  const membershipPledgeOptions = pledgeOptions.filter(
    (po) => !!po.packageOption,
  )

  const membershipPledgeOption =
    membershipPledgeOptions.length > 1
      ? membershipPledgeOptions.find((po) => po.membershipId === membershipId)
      : membershipPledgeOptions[0]

  if (!membershipPledgeOption) {
    console.log(
      'failed to find membershipPledgeOption',
      'userId',
      membership.userId,
      'membershipId',
      membershipId,
      'pledgeId',
      pledge.id,
    )
    return false
  }

  const rewardId = membershipPledgeOption.packageOption.rewardId

  const defaultPaymentMethod = await getDefaultPaymentMethod({
    userId: membership.userId,
    pgdb,
    acceptCachedData: true,
  })

  let defaultPaymentSource
  if (!defaultPaymentMethod) {
    defaultPaymentSource = await getDefaultPaymentSource(
      membership.userId,
      pgdb,
      true,
    )
  }

  if (!defaultPaymentMethod && !defaultPaymentSource) {
    return false
  }

  // paymentMethod takes precedence over source
  // func prolong below expects this order
  // sourceId is used by scheduler/owners/charging to determine
  // if the source changed between suggests
  const sourceId = defaultPaymentMethod?.id || defaultPaymentSource?.id

  // Pick package and options which may be used to submit and autopayment
  const user = await pgdb.public.users.findOne({ id: membership.userId })
  const prolongPackage = (
    await getPackages({ pledger: user, custom: true, pgdb })
  ).find((p) => p.name === 'PROLONG')

  const prolongOption =
    prolongPackage &&
    prolongPackage.options
      .filter(
        (option) => option.membership && option.membership.id === membershipId,
      )
      .filter(
        (option) =>
          option.membershipType && option.membershipType.rewardId === rewardId,
      )
      .shift()

  const endDate = getLastEndDate(membershipPeriods)

  if (prolongOption) {
    return {
      userId: pledge.userId,
      pledgeId: pledge.id,
      companyId: prolongPackage.companyId,
      membershipId: membership.id,
      membershipType: membershipTypes.find((mt) => mt.rewardId === rewardId)
        .name,
      currentPeriods: membershipPeriods,
      endDate,
      graceEndDate: addInterval(endDate, membership.graceInterval),
      prolongedEndDate: getLastEndDate(prolongOption.additionalPeriods),
      additionalPeriods: prolongOption.additionalPeriods,
      total: pledgeOptions.length > 1 ? prolongOption.price : pledge.total,
      defaultPrice: prolongOption.price,
      withDiscount: pledge.donation < 0,
      withDonation: pledge.donation > 0,
      defaultPaymentSource,
      defaultPaymentMethod,
      sourceId,
      // used in email templates
      card: defaultPaymentMethod?.card || defaultPaymentSource,
    }
  }
}

const prolong = async (membershipId, pgdb, redis, t) => {
  const suggestion = await suggest(membershipId, pgdb)

  if (!suggestion) {
    return
  }

  const transaction = await pgdb.transactionBegin()
  try {
    if (!suggestion) {
      throw new Error('suggestion missing')
    }

    let charge
    // paymentMethod takes precedence over source
    // func suggest above expects this order
    if (suggestion.defaultPaymentMethod) {
      const { userId, companyId, defaultPaymentMethod, total, pledgeId } =
        suggestion
      const paymentIntent = await createPaymentIntent({
        userId,
        companyId,
        platformPaymentMethodId: defaultPaymentMethod.id,
        total: total,
        pledgeId: pledgeId,
        metadata: {
          AutoPay: true,
        },
        offSession: true,
        pgdb,
        t,
      })

      // this should not happen, as stripe throws an error if charge==true and offSession==true
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(
          `AutoPay: paymentIntent did not succeed immediately. status: ${paymentIntent.status}`,
        )
      }

      charge = paymentIntent.charges.data[0]
    } else {
      // Create a charge via Stripe
      charge = await createCharge({
        amount: suggestion.total,
        userId: suggestion.userId,
        companyId: suggestion.companyId,
        pgdb: transaction,
      })
    }

    // Insert payment
    const payment = await transaction.public.payments.insertAndGet({
      type: 'PLEDGE',
      method: 'STRIPE',
      total: charge.amount,
      status: 'PAID',
      pspId: charge.id,
      pspPayload: charge,
    })

    // Insert link between payment and pledge
    await transaction.public.pledgePayments.insert({
      pledgeId: suggestion.pledgeId,
      paymentId: payment.id,
      paymentType: 'PLEDGE',
    })

    // Insert membership periods
    await transaction.public.membershipPeriods.insert(
      suggestion.additionalPeriods.map((period) => {
        // Omit period.id, period.createdAt, period.updatedAt
        const { id, createdAt, updatedAt, ...sanitizedPeriod } = period
        return { ...sanitizedPeriod, pledgeId: suggestion.pledgeId }
      }),
    )

    // Invalidate User resolver cache
    const cache = createCache(
      { prefix: `User:${suggestion.userId}` },
      { redis },
    )
    cache.invalidate()

    // Insert charge attempt
    const chargeAttempt = await transaction.public.chargeAttempts.insertAndGet({
      membershipId: suggestion.membershipId,
      total: suggestion.total,
      status: 'SUCCESS',
      paymentId: payment.id,
      createdAt: new Date(),
      sourceId: suggestion.sourceId,
    })

    await transaction.transactionCommit()

    debug('charge successful: %o', {
      membershipId: suggestion.membershipId,
      total: suggestion.total,
      paymentId: payment.id,
    })

    return { suggestion, chargeAttempt }
  } catch (e) {
    // Keep it together
    await transaction.transactionRollback()

    const error = {
      type: e.type,
      stack: e.stack,
      name: e.name,
      message: e.message,
      raw: e.raw,
    }

    debug('charge/paymentIntent failed: %o', {
      membershipId: suggestion.membershipId,
      total: suggestion.total,
      error,
    })

    const chargeAttempt = await pgdb.public.chargeAttempts.insertAndGet({
      membershipId: suggestion.membershipId,
      total: suggestion.total,
      status: 'ERROR',
      error,
      createdAt: new Date(),
      sourceId: suggestion.sourceId,
    })

    return { suggestion, chargeAttempt }
  }
}

module.exports = {
  suggest,
  prolong,
}
