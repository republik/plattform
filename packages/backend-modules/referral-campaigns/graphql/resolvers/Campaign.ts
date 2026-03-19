import type { GraphqlContext } from '@orbiting/backend-modules-types'
import type { Campaign } from '../types'
import { PGReferralsRepo } from '../../lib/repo'

export = {
  async referrals(campaign: Campaign, _args: never, ctx: GraphqlContext) {
    const referralCount =
      (await new PGReferralsRepo(ctx.pgdb).getCampaignReferralCount(
        campaign.id,
      )) || 0
    return { count: referralCount }
  },
  /**
   * Returns the count of new memberships and subscriptions that sigend up
   * during the campaign.
   */
  async newMembers(campaign: Campaign, _args: never, ctx: GraphqlContext) {
    const referralCount =
      (await new PGReferralsRepo(ctx.pgdb).getCampaignNewMemberCount(
        campaign.id,
      )) || 0

    return { count: referralCount }
  },
}
