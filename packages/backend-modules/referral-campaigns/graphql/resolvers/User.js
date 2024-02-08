const { Roles } = require('@orbiting/backend-modules-auth')
const {
  generateReferralCode,
  formatAsDashSeperated,
} = require('../../lib/referralCode')
const {
  fetchReferralCountByReferrerId,
  fetchCampaignBySlug,
} = require('../../lib/db-queries')

/** @typedef {{count: number}} ReferralCount */
/** @typedef {import('@orbiting/backend-modules-types').GraphqlContext} GraphqlContext */

module.exports = {
  /**
   * Load the user's referrals count in total or for a specific campaign.
   * @param {object} user
   * @param {{ campaignSlug: string | undefined | null}} args
   * @param {GraphqlContext} ctx
   * @returns {Promise<ReferralCount?>}
   */
  async referrals(user, { campaignSlug = null }, ctx) {
    const { pgdb, user: me } = ctx
    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])

    try {
      if (!campaignSlug) {
        // if slug is missing query all user referrals
        const referralsCount = await fetchReferralCountByReferrerId(
          user.id,
          ctx.pgdb,
        )

        return {
          count: referralsCount,
        }
      }

      const campaign = await fetchCampaignBySlug(campaignSlug, pgdb)
      if (!campaign) {
        return null
      }

      const referralsCount = await pgdb.public.referrals.count({
        campaignId: campaign.id,
        referrerId: user.id,
      })
      return { count: referralsCount }
    } catch (error) {
      console.log(error)
    }
    return null
  },
  referralCode: async (user, _, { pgdb }) => {
    const referralCode =
      user.referralCode || (await generateReferralCode(user, pgdb))

    return formatAsDashSeperated(referralCode, 4)
  },
}
