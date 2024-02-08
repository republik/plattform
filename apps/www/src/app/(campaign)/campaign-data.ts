import {
  CampaignInviteeDocument,
  CampaignSenderDocument,
} from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'

export async function getInviteeData({ code }: { code: string }) {
  const { data } = await getClient().query({
    query: CampaignInviteeDocument,
    variables: { inviteCode: code },
    errorPolicy: 'all',
  })

  return data
}

export async function getSenderData() {
  const { data } = await getClient().query({
    query: CampaignSenderDocument,
  })

  return data
}

// TODO
// export async function getCampaignReferralsData() {
// }
