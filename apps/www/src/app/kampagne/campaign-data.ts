import { CampaignReferralsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { CAMPAIGN_SLUG } from '@app/app/kampagne/campaign-config'
import { getClient } from '@app/lib/apollo/client'

export async function getCampaignReferralsData() {
  const client = await getClient()
  const { data } = await client.query({
    query: CampaignReferralsDocument,
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  return data
}
