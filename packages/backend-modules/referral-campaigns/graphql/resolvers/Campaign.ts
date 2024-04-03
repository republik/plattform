import type { GraphqlContext } from '@orbiting/backend-modules-types'
import type { Campaign } from '../types'
import { PGReferralsRepo } from '../../lib/repo'

export = {
  async referrals(campaign: Campaign, _args: any, ctx: GraphqlContext) {
    const referralCount =
      (await new PGReferralsRepo(ctx.pgdb).getCampaignReferralCount(
        campaign.id,
      )) || 0
    return { count: referralCount }
  },
}
