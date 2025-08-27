import {
  CampaignInviteDocument,
  CampaignReferralsDocument,
  CampaignSenderDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'

const CAMPAIGN_SLUG = 'autumn-2025'

export async function getInviteeData({ code }: { code: string }) {
  const client = await getClient()
  const { data } = await client.query({
    query: CampaignInviteDocument,
    variables: { code },
    errorPolicy: 'all',
  })

  return data
}

export async function getSenderData() {
  const client = await getClient()
  const { data } = await client.query({
    query: CampaignSenderDocument,
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  return data
}

export async function getCampaignReferralsData() {
  const client = await getClient()
  const { data } = await client.query({
    query: CampaignReferralsDocument,
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  return data
}
