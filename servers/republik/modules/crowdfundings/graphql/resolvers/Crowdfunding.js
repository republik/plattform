module.exports = {
  async packages (crowdfunding, args, {pgdb}) {
    return pgdb.public.packages.find({
      crowdfundingId: crowdfunding.id,
      custom: false
    })
  },
  async goals (crowdfunding, args, {pgdb}) {
    return pgdb.public.crowdfundingGoals.find({crowdfundingId: crowdfunding.id}, {
      orderBy: ['people asc', 'money asc']
    })
  },
  async status (crowdfunding, { forceUpdate }, { pgdb }) {
    if (!forceUpdate && crowdfunding.result && crowdfunding.result.status) {
      const { status } = crowdfunding.result
      return {
        ...status,
        forceUpdate,
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
