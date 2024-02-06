const { Roles } = require('@orbiting/backend-modules-auth')
const {
  generateReferralCode,
  formatAsDashSeperated,
} = require('../../lib/referralCode')

module.exports = {
  /**
   * Load the user's referrals count in total or for a specific campaign.
   * @param {object} user
   * @param {{ campaign: string | undefined | null}} args
   * @param {{ pgdb: object, user: object}} ctx
   * @returns {Promise<{count: number}>}
   */
  async referrals(user, args, ctx) {
    const { pgdb, user: me } = ctx
    const { campaign: campaignId = null } = args

    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

    const referralsCount = await pgdb.public.referrals.count(
      campaignId
        ? { campaignId, referrerId: user.id }
        : { referrerId: user.id },
    )

    return {
      count: referralsCount || 0,
    }
  },
  referralCode: async (user, _, { pgdb }) => {
    const referralCode =
      user.referralCode || (await generateReferralCode(user, pgdb))

    return formatAsDashSeperated(referralCode, 3)
  },
}
