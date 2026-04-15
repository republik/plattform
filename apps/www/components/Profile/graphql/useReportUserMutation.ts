import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

const REPORT_USER_MUTATION = gql`
  mutation reportUser($userId: ID!, $reason: String!) {
    reportUser(userId: $userId, reason: $reason)
  }
`

type ReportUserMutation = {
  data: {
    reportUser: boolean
  }
  variables: {
    userId: string
    reason: string
  }
}

export const useReportUserMutation = makeMutationHook<
  ReportUserMutation['data'],
  ReportUserMutation['variables']
>(REPORT_USER_MUTATION)
