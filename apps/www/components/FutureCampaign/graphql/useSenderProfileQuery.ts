import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const INVITE_SENDER_PROFILE_QUERY = gql`
  query UserInviterProfileInfo($accessToken: ID, $slug: String) {
    sender: user(accessToken: $accessToken, slug: $slug) {
      id
      firstName
      lastName
      portrait
    }
  }
`

export type InviteSenderProfileQueryData = {
  sender?: {
    id: string
    firstName?: string
    lastName?: string
    portrait?: string
  }
}

export type InviteSenderProfileQueryVariables = {
  accessToken?: string
  slug?: string
}

export const useInviteSenderProfileQuery = makeQueryHook<
  InviteSenderProfileQueryData,
  InviteSenderProfileQueryVariables
>(INVITE_SENDER_PROFILE_QUERY)
