const { ascending } = require('d3-array')

module.exports = {
  async packages (crowdfunding, args, { pgdb }) {
    const now = new Date()

    const packages = await pgdb.public.packages.find(
      { crowdfundingId: crowdfunding.id, custom: false },
      { orderBy: { order: 'asc' } }
    )

    const packageOptions =
      await pgdb.public.packageOptions.find(
        {
          packageId: packages.map(p => p.id),
          and: [
            { or: [{ 'disabledAt >': now }, { disabledAt: null }] },
            { or: [{ 'hiddenAt >': now }, { hiddenAt: null }] }
          ]
        },
        { orderBy: { order: 'asc' } }
      )

    return packages
      .map(package_ => ({
        ...package_,
        options: packageOptions
          .filter(po => po.packageId === package_.id)
          .map(option => ({
            ...option,
            templateId: option.id,
            package: package_
          }))
          .sort((a, b) => ascending(a.order, b.order))
      }))
      .filter(package_ => package_.options.length > 0)
      .sort((a, b) => ascending(a.order, b.order))
  },
  async goals (crowdfunding, args, { pgdb }) {
    return pgdb.public.crowdfundingGoals.find({ crowdfundingId: crowdfunding.id }, {
      orderBy: ['people asc', 'money asc']
    })
  },
  async status (crowdfunding, { ignoreFreeze }, { pgdb }) {
    if (!ignoreFreeze && crowdfunding.result && crowdfunding.result.status) {
      const { status } = crowdfunding.result
      return {
        ...status,
        ignoreFreeze,
        memberships: status.memberships || 0
      }
    }
    return { // for downstream resolvers
      crowdfunding
    }
  },
  hasEnded (crowdfunding) {
    const now = new Date()
    return now > new Date(crowdfunding.endDate)
  },
  endVideo (crowdfunding) {
    if (crowdfunding.result) {
      return crowdfunding.result.endVideo
    }
  }
}
