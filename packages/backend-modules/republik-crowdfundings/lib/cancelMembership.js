const debug = require('debug')('crowdfundings:cancelMembership')

const cancelSubscription = require('./payments/stripe/cancelSubscription')

async function overdue(membership, pgdb) {
  if (!membership.active) return false

  const latestPeriod = await pgdb.public.membershipPeriods.findFirst(
    {
      membershipId: membership.id,
    },
    { orderBy: { endDate: 'DESC' } },
  )

  if (!latestPeriod) {
    return false
  }

  const isLatestPeriodEnded = new Date(latestPeriod.endDate) < new Date()
  return isLatestPeriodEnded
}

module.exports = async (membership, details, options, t, pgdb) => {
  const {
    reason,
    type,
    suppressConfirmation,
    suppressWinback,
    cancelledViaSupport,
  } = details
  let { immediately } = options

  if (immediately || (await overdue(membership, pgdb))) {
    immediately = true
  }

  debug('%o', {
    membership: membership.id,
    details,
    options,
    immediately,
  })

  if (!membership.membershipType) {
    membership.membershipType = await pgdb.public.membershipTypes.findOne({
      id: membership.membershipTypeId,
    })
  }

  if (
    membership.membershipType.name === 'MONTHLY_ABO' &&
    !membership.subscriptionId
  ) {
    throw new Error(t('api/membership/pleaseWait'))
  }

  const updatedMembership = await pgdb.public.memberships.updateAndGetOne(
    {
      id: membership.id,
    },
    {
      renew: false,
      active: immediately ? false : membership.active,
      updatedAt: new Date(),
    },
  )

  await pgdb.public.membershipCancellations.insert({
    membershipId: updatedMembership.id,
    reason,
    category: type,
    suppressConfirmation: !!suppressConfirmation,
    suppressWinback: !!suppressWinback,
    cancelledViaSupport: !!cancelledViaSupport,
  })

  if (updatedMembership.subscriptionId) {
    await cancelSubscription({
      id: updatedMembership.subscriptionId,
      companyId: membership.membershipType.companyId,
      immediately,
      pgdb,
    })
  }

  return updatedMembership
}
