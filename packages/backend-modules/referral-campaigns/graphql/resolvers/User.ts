import type { GraphqlContext, User } from '@orbiting/backend-modules-types'
import type { PgDb } from 'pogi'
import type { ReferralCount } from '../types'
import {
  generateReferralCode,
  formatAsDashSeperated,
  fetchReferralCountByReferrerId,
  fetchCampaignBySlug,
} from '../../lib'

const { Roles } = require('@orbiting/backend-modules-auth')

type UserReferralArgs = { campaignSlug: string | undefined | null }

export = {
  /**
   * Load the user's referrals count in total or for a specific campaign.
   */
  async referrals(
    user: User,
    { campaignSlug = null }: UserReferralArgs,
    ctx: GraphqlContext,
  ): Promise<ReferralCount | null> {
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
  async referralCode(
    user: User,
    _: object,
    { pgdb }: { pgdb: PgDb },
  ): Promise<string> {
    const referralCode =
      user.referralCode || (await generateReferralCode(user, pgdb))

    return formatAsDashSeperated(referralCode, 4)
  },
}
