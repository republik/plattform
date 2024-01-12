import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

type NumOfRedeemedInvitesQueryData = {
  me?: {
    id: string
    futureCampaignAboCount?: number
  }
}

export const NUM_OF_REDEEMED_INVITES_QUERY = gql`
  query NumOfRedeemedInvitesQuery {
    me {
      id
      futureCampaignAboCount
    }
  }
`

export const useNumOfRedeemedInvitesQuery =
  makeQueryHook<NumOfRedeemedInvitesQueryData>(NUM_OF_REDEEMED_INVITES_QUERY)
