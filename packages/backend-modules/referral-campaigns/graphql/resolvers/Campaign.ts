import type { GraphqlContext } from '@orbiting/backend-modules-types'
import type { Campaign } from '../types'
import { campaignReferralCount } from '../../lib/referralHandler'

export = {
  async referrals(campaign: Campaign, _args: any, context: GraphqlContext) {
    const referralCount =
      (await campaignReferralCount(campaign.id, context.pgdb)) || 0
    return { count: referralCount }
  },
}
