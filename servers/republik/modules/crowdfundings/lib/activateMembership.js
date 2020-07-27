const moment = require('moment')
const Promise = require('bluebird')

const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const cancelMembership = require('./cancelMembership')

module.exports = async (membership, user, t, pgdb) => {
  const now = moment()
  const hasActiveMembership = await hasUserActiveMembership(user, pgdb)

  // transfer new membership, and remove voucherCode
  const updatedMembership = await pgdb.public.memberships.updateAndGetOne(
    { id: membership.id },
    {
      userId: user.id,
      voucherCode: null,
      voucherable: false,
      // Set added membership.active to false if other membership is still
      // active.
      active: !hasActiveMembership,
      renew: !hasActiveMembership,
      updatedAt: now
    }
  )

  if (!hasActiveMembership) {
    // generate interval
    const beginDate = now.clone()
    const endDate = beginDate.clone().add(
      membership.initialPeriods,
      membership.initialInterval
    )

    await pgdb.public.membershipPeriods.insert({
      membershipId: membership.id,
      pledgeId: membership.pledgeId,
      beginDate,
      endDate
    })
  } else {
    // Cancel active memberships.
    const activeMemberships = await pgdb.public.memberships.find({
      'id !=': membership.id,
      userId: user.id,
      active: true,
      renew: true
    })

    const details = {
      type: 'SYSTEM',
      reason: 'Auto Cancellation (activateMembership)',
      suppressConfirmation: true,
      suppressWinback: true
    }

    const options = {}

    await Promise.map(
      activeMemberships,
      membership => cancelMembership(
        membership,
        details,
        options,
        t,
        pgdb
      )
    )
  }

  return updatedMembership
}
