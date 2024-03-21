import type { GraphqlContext, User } from '@orbiting/backend-modules-types'
import type { PgDb } from 'pogi'
import type { ReferralCount } from '../types'
import { generateReferralCode, formatAsDashSeperated } from '../../lib'
import { PGReferralsRepo } from '../../lib/repo'

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
    const repo = new PGReferralsRepo(pgdb)
    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])
    try {
      if (!campaignSlug) {
        // if slug is missing query all user referrals
        const referralsCount = await repo.getReferralCountByReferrerId(user.id)
        return {
          count: referralsCount,
        }
      }

      const campaign = await repo.getCampaignBySlug(campaignSlug)
      if (!campaign) {
        return null
      }

      const referralsCount = await repo.getUserCampaignReferralCount(
        campaign.id,
        user.id,
      )
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
  ): Promise<string | null> {
    const repo = new PGReferralsRepo(pgdb)

    const referralCode =
      user.referralCode || (await generateReferralCode(user, repo))
    if (!referralCode) {
      return null
    }
    return formatAsDashSeperated(referralCode, 4)
  },
}
