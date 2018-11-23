const { transformUser } = require('@orbiting/backend-modules-auth')

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
  },
  async user (membership, args, { user: me, pgdb }) {
    const user = await pgdb.public.users.findOne({ id: membership.userId })

    return transformUser(user)
  },
  async cancellations ({ id, cancelReasons }, args, { user: me, pgdb }) {
    return pgdb.public.membershipCancellations.find({
      membershipId: id
    })
      .then(cancellations => cancellations.map(cancellation => ({
        ...cancellation,
        category: {
          type: cancellation.category
        }
      })))
  }
}
