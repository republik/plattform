const { Roles, transformUser } = require('@orbiting/backend-modules-auth')
const { ascending, descending } = require('d3-array')

module.exports = {
  async options (pledge, args, { pgdb, user: me }) {
    const user = await pgdb.public.users.findOne({ id: pledge.userId })
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return []
    }

    // we augment pledgeOptions with packageOptions
    const pledgeOptions =
      await pgdb.public.pledgeOptions.find({ pledgeId: pledge.id })

    if (!pledgeOptions.length) {
      return []
    }

    const packageOptions =
      await pgdb.public.packageOptions.find({
        id: pledgeOptions.map(pledgeOption => pledgeOption.templateId)
      })

    return pledgeOptions
      .map(pledgeOption => {
        const packageOption = packageOptions.find(
          packageOption => pledgeOption.templateId === packageOption.id
        )

        // A (virtual) ID for pledgeOption, consisting pledgeId, templateID and
        // membershipId.
        const id = [
          pledgeOption.pledgeId,
          pledgeOption.templateId,
          pledgeOption.membershipId
        ].filter(Boolean).join('-')

        // Shallow packageOption object copy, superimpose pledgeOption, then
        // overwrite with (virtual) ID
        return Object.assign(
          {},
          packageOption,
          pledgeOption,
          { id }
        )
      })
      // Sort by price
      .sort((a, b) => descending(a.price, b.price))
      // Sort by packageOption.order
      .sort((a, b) => ascending(a.order, b.order))
  },
  async package (pledge, args, { pgdb }) {
    return pgdb.public.packages.findOne({ id: pledge.packageId })
  },
  async user (pledge, args, { pgdb }) {
    const user = transformUser(await pgdb.public.users.findOne({
      id: pledge.userId
    }))
    if (user && !user.verified && pledge.status === 'DRAFT') {
      return {
        ...user,
        _exposeEmail: true
      }
    }
    return user
  },
  async payments (pledge, args, { pgdb, user: me }) {
    const user = await pgdb.public.users.findOne({ id: pledge.userId })

    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return []
    }

    const pledgePayments = await pgdb.public.pledgePayments.find({ pledgeId: pledge.id })
    return pledgePayments.length
      ? pgdb.public.payments.find(
        { id: pledgePayments.map(pp => pp.paymentId) },
        { orderBy: { createdAt: 'desc' } }
      )
      : []
  },
  async memberships (pledge, args, { pgdb, user: me }) {
    const user = await pgdb.public.users.findOne({ id: pledge.userId })

    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return []
    }

    const memberships = await pgdb.public.memberships.find({ pledgeId: pledge.id })
    if (!memberships.length) return []
    // augment memberships with claimer's names
    const users = await pgdb.public.users.find({ id: memberships.map(m => m.userId) })
    return memberships.map(membership => {
      if (membership.userId !== pledge.userId) { // membership was vouchered to somebody else
        const user = users.find(u => u.id === membership.userId)
        return Object.assign({}, membership, {
          claimerName: user.firstName + ' ' + user.lastName
        })
      }
      return membership
    })
  }
}
