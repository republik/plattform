import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { Campaign } from '../../types'

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
  const campaign = await ctx.pgdb.public.campaigns.findOne({ slug: slug })

  return campaign
}
