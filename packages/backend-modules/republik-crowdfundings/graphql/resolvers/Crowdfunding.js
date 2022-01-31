const { getPackages } = require('../../lib/User')

module.exports = {
  packages(crowdfunding, args, { user, pgdb }) {
    return getPackages({
      crowdfunding,
      pledger: user, // miiight be empty
      custom: false,
      pgdb,
    })
  },
  async goals(crowdfunding, args, { pgdb }) {
    return pgdb.public.crowdfundingGoals.find(
      { crowdfundingId: crowdfunding.id },
      {
        orderBy: ['people asc', 'money asc'],
      },
    )
  },
  async status(crowdfunding, { ignoreFreeze }, { pgdb }) {
    if (!ignoreFreeze && crowdfunding.result && crowdfunding.result.status) {
      const { status } = crowdfunding.result
      return {
        ...status,
        ignoreFreeze,
        memberships: status.memberships || 0,
      }
    }
    return {
      // for downstream resolvers
      crowdfunding,
    }
  },
  hasEnded(crowdfunding) {
    const now = new Date()
    return now > new Date(crowdfunding.endDate)
  },
  endVideo(crowdfunding) {
    if (crowdfunding.result) {
      return crowdfunding.result.endVideo
    }
  },
}
