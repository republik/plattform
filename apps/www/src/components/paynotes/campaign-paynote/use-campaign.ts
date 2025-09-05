import { CampaignReferralsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { CAMPAIGN_SLUG } from '@app/app/(campaign)/campaign-config'

export function useCampaign() {
  const { data, loading } = useQuery(CampaignReferralsDocument, {
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })
  return { campaign: data?.campaign, loading }
}
