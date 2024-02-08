const { campaignReferralCount } = require('../../lib/referralHandler')

module.exports = {
  async referrals(campaign, args, context) {
    const referralCount =
      (await campaignReferralCount(campaign.id, context.pgdb)) || 0
    return { count: referralCount }
  },
}
