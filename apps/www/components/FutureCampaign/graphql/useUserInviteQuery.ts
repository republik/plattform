import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const USER_INVITE_QUERY = gql`
  query UserInviteLinkInfo {
    me {
      hasPublicProfile
      slug
      accessToken(scope: NOW_YOU_SEE_ME)
    }
  }
`

export type UserInviteQueryData = {
  me?: {
    hasPublicProfile: boolean
    slug: string
    accessToken: string
  }
}

export const useUserInviteQuery =
  makeQueryHook<UserInviteQueryData>(USER_INVITE_QUERY)
