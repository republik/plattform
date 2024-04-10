import type { GraphqlContext } from '@orbiting/backend-modules-types'
import type { Campaign } from '../../types'
import { PGReferralsRepo } from '../../../lib/repo'
import { transformCampaign } from '../../../lib/campaign'

type CampgainArgs = {
  slug: string
}

/**
 * Find resolve campaign by slug
 */
export = async function campaigns(
  _: any,
  { slug }: CampgainArgs,
  ctx: GraphqlContext,
): Promise<Campaign | null> {
  const campaign = await new PGReferralsRepo(ctx.pgdb).getCampaignBySlug(slug)
  if (!campaign) {
    return null
  }

  return transformCampaign(campaign)
}
