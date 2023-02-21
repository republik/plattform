import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const INVITE_SENDER_PROFILE_QUERY = gql`
  query UserInviterProfileInfo($accessToken: ID) {
    sender: user(accessToken: $accessToken) {
      id
      firstName
      lastName
      portrait
      futureCampaignAboCount
    }
  }
`

export type InviteSenderProfileQueryData = {
  sender?: {
    id: string
    firstName?: string
    lastName?: string
    portrait?: string
    futureCampaignAboCount?: number
  }
}

export type InviteSenderProfileQueryVariables = {
  accessToken?: string
}

export const useInviteSenderProfileQuery = makeQueryHook<
  InviteSenderProfileQueryData,
  InviteSenderProfileQueryVariables
>(INVITE_SENDER_PROFILE_QUERY)
