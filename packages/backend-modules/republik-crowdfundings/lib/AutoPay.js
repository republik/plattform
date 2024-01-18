const debug = require('debug')('crowdfundings:lib:AutoPay')

const {
  applyPgInterval: { add: addInterval },
} = require('@orbiting/backend-modules-utils')

const createCharge = require('./payments/stripe/createCharge')
const { getCustomPackages } = require('./User')
const { getLastEndDate } = require('./utils')
const createCache = require('./cache')

const {
  getDefaultPaymentSource: getDefaultStripePaymentSource,
} = require('./payments/stripe/paymentSource')

const {
  getDefaultPaymentMethod: getDefaultStripePaymentMethod,
} = require('./payments/stripe/paymentMethod')
const createPaymentIntent = require('./payments/stripe/createPaymentIntent')
const Promise = require('bluebird')
const {
  getDefaultPaymentSource: getDefaultDatatransPaymentSource,
} = require('@orbiting/backend-modules-datatrans/lib/paymentSources')
const {
  authorizeAndSettleTransaction,
  getMerchant,
  formatHridAsRefno,
} = require('@orbiting/backend-modules-datatrans/lib/helpers')

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

  const defaultDatatransPaymentSource = await getDefaultDatatransPaymentSource(
    membership.userId,
    pgdb,
  )

  const defaultPaymentMethod = await getDefaultStripePaymentMethod({
    userId: membership.userId,
    pgdb,
    acceptCachedData: true,
  })

  let defaultPaymentSource
  if (!defaultPaymentMethod) {
    defaultPaymentSource = await getDefaultStripePaymentSource(
      membership.userId,
      pgdb,
      true,
    )
  }

  if (
    !defaultDatatransPaymentSource &&
    !defaultPaymentMethod &&
    !defaultPaymentSource
  ) {
    return false
  }

  // paymentMethod takes precedence over source
  // func prolong below expects this order
  // sourceId is used by scheduler/owners/charging to determine
  // if the source changed between suggests
  const sourceId =
    defaultDatatransPaymentSource?.id ||
    defaultPaymentMethod?.id ||
    defaultPaymentSource?.id

  // Pick package and options which may be used to submit an autopayment
  const user = await pgdb.public.users.findOne({ id: membership.userId })
  const prolongPackage = (await getCustomPackages({ user, pgdb })).find(
    (p) => p.name === 'PROLONG',
  )

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
    const membershipType = membershipTypes.find(
      (mt) => mt.rewardId === rewardId,
    )
    return {
      userId: pledge.userId,
      pledgeId: pledge.id,
      companyId: membershipType.companyId,
      membershipId: membership.id,
      membershipType: membershipType.name,
      membershipTypeInterval: membershipType.interval,
      currentPeriods: membershipPeriods,
      endDate,
      graceEndDate: addInterval(endDate, membership.graceInterval),
      prolongedEndDate: getLastEndDate(prolongOption.additionalPeriods),
      additionalPeriods: prolongOption.additionalPeriods,
      total: pledgeOptions.length > 1 ? prolongOption.price : pledge.total,
      defaultPrice: prolongOption.price,
      withDiscount: pledge.donation < 0,
      withDonation: pledge.donation > 0,
      defaultDatatransPaymentSource,
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

  // Insert payment to get hrid
  const payment = await pgdb.public.payments.insertAndGet({
    type: 'PLEDGE',
    method: suggestion.defaultDatatransPaymentSource?.method || 'STRIPE',
    total: suggestion.total,
  })

  // Insert link between payment and pledge
  await pgdb.public.pledgePayments.insert({
    pledgeId: suggestion.pledgeId,
    paymentId: payment.id,
    paymentType: 'PLEDGE',
  })

  const transaction = await pgdb.transactionBegin()

  try {
    if (!suggestion) {
      throw new Error('suggestion missing')
    }

    let charge

    if (suggestion.defaultDatatransPaymentSource) {
      const { companyId, total, defaultDatatransPaymentSource } = suggestion

      const datatransTrx = await authorizeAndSettleTransaction({
        merchant: getMerchant(companyId),
        amount: total,
        refno: formatHridAsRefno(payment.hrid),
        alias: defaultDatatransPaymentSource.pspPayload,
      })

      charge = {
        ...datatransTrx,
        amount: total,
        method: defaultDatatransPaymentSource.method,
        id: datatransTrx.transactionId,
      }
    } else if (suggestion.defaultPaymentMethod) {
      // paymentMethod takes precedence over source
      // func suggest above expects this order
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

    // Update payment
    await transaction.public.payments.updateOne(
      { id: payment.id },
      {
        total: charge.amount,
        status: 'PAID',
        pspId: charge.id,
        pspPayload: charge,
      },
    )

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
      paymentId: payment.id,
      sourceId: suggestion.sourceId,
    })

    await transaction.public.payments.updateOne(
      { id: payment.id },
      {
        status: 'CANCELLED',
        pspPayload: { chargeAttempt },
      },
    )

    return { suggestion, chargeAttempt }
  }
}

module.exports = {
  suggest,
  prolong,
}
