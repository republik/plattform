import { CampaignReferralsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { CAMPAIGN_SLUG, TARGET } from '@/app/kampagne/campaign-config'
import { getClient } from '@/app/lib/apollo/client'

export async function getCampaignSuccess() {
  const client = await getClient()
  const { data } = await client.query({
    query: CampaignReferralsDocument,
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  const count = data?.campaign?.newMembers?.count ?? 0

  return {
    success: count >= TARGET,
  }
}
