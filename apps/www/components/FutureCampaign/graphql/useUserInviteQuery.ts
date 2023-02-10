import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const USER_INVITE_QUERY = gql`
  query UserInviteLinkInfo {
    me {
      accessToken(scope: NOW_YOU_SEE_ME)
      hasPublicProfile
    }
  }
`

export type UserInviteQueryData = {
  me?: {
    accessToken: string
    hasPublicProfile: boolean
  }
}

export const useUserInviteQuery =
  makeQueryHook<UserInviteQueryData>(USER_INVITE_QUERY)
