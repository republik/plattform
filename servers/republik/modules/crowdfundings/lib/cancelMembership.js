const debug = require('debug')('crowdfundings:cancelMembership')

const cancelSubscription = require('./payments/stripe/cancelSubscription')

module.exports = async (membership, details, options, t, pgdb) => {
  const { reason, type, suppressConfirmation, suppressWinback, cancelledViaSupport } = details
  const { immediately } = options

  debug('%o', { membership: membership.id, details, options })

  if (!membership.membershipType) {
    membership.membershipType = await pgdb.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })
  }

  if (membership.membershipType.name === 'MONTHLY_ABO' && !membership.subscriptionId) {
    throw new Error(t('api/membership/pleaseWait'))
  }

  const updatedMembership = await pgdb.public.memberships.updateAndGetOne({
    id: membership.id
  }, {
    renew: false,
    active: immediately
      ? false
      : membership.active,
    updatedAt: new Date()
  })

  await pgdb.public.membershipCancellations.insert({
    membershipId: updatedMembership.id,
    reason,
    category: type,
    suppressConfirmation: !!suppressConfirmation,
    suppressWinback: !!suppressWinback,
    cancelledViaSupport: !!cancelledViaSupport
  })

  if (updatedMembership.subscriptionId) {
    await cancelSubscription({
      id: updatedMembership.subscriptionId,
      companyId: membership.membershipType.companyId,
      immediately,
      pgdb
    })
  }

  return updatedMembership
}
