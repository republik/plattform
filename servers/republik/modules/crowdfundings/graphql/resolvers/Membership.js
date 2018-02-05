module.exports = {
  async type (membership, args, { pgdb }) {
    return pgdb.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })
  },
  async overdue (membership, args, { pgdb }) {
    if (!membership.active || !membership.latestPaymentFailedAt) {
      return false
    }

    const latest = await pgdb.public.membershipPeriods.findFirst({
      membershipId: membership.id
    }, {fields: '"endDate"', orderBy: ['endDate desc']})
    return !!(
      membership.active &&
      membership.latestPaymentFailedAt &&
      membership.latestPaymentFailedAt > latest.endDate
    )
  },
  async pledge (membership, args, { pgdb }) {
    if (membership.pledge) {
      return membership.pledge
    }
    return pgdb.public.pledges.findOne({
      id: membership.pledgeId
    })
  },
  async periods (membership, args, { pgdb }) {
    return pgdb.public.membershipPeriods.find({
      membershipId: membership.id
    }, {orderBy: ['endDate desc']})
  }
}
