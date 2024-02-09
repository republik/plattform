import {
  CampaignInviteDocument,
  CampaignReferralsDocument,
  CampaignSenderDocument,
} from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'

export const CAMPAIGN_SLUG = 'spring-2024'

export async function getInviteeData({ code }: { code: string }) {
  const { data } = await getClient().query({
    query: CampaignInviteDocument,
    variables: { code },
    errorPolicy: 'all',
  })

  return data
}

export async function getSenderData() {
  const { data } = await getClient().query({
    query: CampaignSenderDocument,
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  return data
}

export const CAMPAIGN_REFERRALS_GOAL = 1000

export async function getCampaignReferralsData() {
  const { data } = await getClient().query({
    query: CampaignReferralsDocument,
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  return data
}
