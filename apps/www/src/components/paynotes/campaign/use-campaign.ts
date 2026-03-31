import { CampaignReferralsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { CAMPAIGN_SLUG, TARGET } from '@app/app/kampagne/campaign-config'
import React, { useEffect } from 'react'

export function useCampaign() {
  const { data, loading } = useQuery(CampaignReferralsDocument, {
    variables: { campaignSlug: CAMPAIGN_SLUG },
  })

  const [members, setMembers] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [success, setSuccess] = React.useState(false)

  useEffect(() => {
    if (loading) return
    const count = data?.campaign?.newMembers?.count
    if (!count) return
    setMembers(count)
    setProgress((count / TARGET) * 100)
    setSuccess(count >= TARGET)
  }, [loading, data, setMembers, setProgress, setSuccess])

  return { campaign: data?.campaign, loading, members, progress, success }
}
