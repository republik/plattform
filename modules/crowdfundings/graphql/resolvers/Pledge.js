const { transformUser } = require('@orbiting/backend-modules-auth')
module.exports = {
  async options (pledge, args, {pgdb}) {
    // we augment pledgeOptions with packageOptions
    const pledgeOptions = await pgdb.public.pledgeOptions.find({pledgeId: pledge.id})
    if (!pledgeOptions.length) return []
    const pledgeOptionTemplateIds = pledgeOptions.map((plo) => plo.templateId)
    const packageOptions = await pgdb.public.packageOptions.find({id: pledgeOptionTemplateIds})
    return pledgeOptions.map((plo) => {
      const pko = packageOptions.find((pko) => plo.templateId === pko.id)
      pko.id = plo.pledgeId + '-' + plo.templateId // combinded primary key
      pko.amount = plo.amount
      pko.templateId = plo.templateId
      pko.price = plo.price
      pko.createdAt = plo.createdAt
      pko.updatedAt = plo.updatedAt
      return pko
    })
  },
  async package (pledge, args, {pgdb}) {
    return pgdb.public.packages.findOne({id: pledge.packageId})
  },
  async user (pledge, args, {pgdb}) {
    return transformUser(await pgdb.public.users.findOne({id: pledge.userId}))
  },
  async payments (pledge, args, {pgdb}) {
    const pledgePayments = await pgdb.public.pledgePayments.find({pledgeId: pledge.id})
    return pledgePayments.length
      ? pgdb.public.payments.find({id: pledgePayments.map((pp) => { return pp.paymentId })})
      : []
  },
  async memberships (pledge, args, {pgdb}) {
    const memberships = await pgdb.public.memberships.find({pledgeId: pledge.id})
    if (!memberships.length) return []
    // augment memberships with claimer's names
    const users = await pgdb.public.users.find({id: memberships.map(m => m.userId)})
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
