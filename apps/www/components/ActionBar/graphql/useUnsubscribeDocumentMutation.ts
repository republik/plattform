import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { subInfo } from '../../Notifications/enhancers'
import EventObjectType from './EventObjectType'

const UNSUBSCRIBE_DOCUMENT_MUTATION = gql`
  mutation unsubscribeDocumentMutation(
    $subscriptionId: ID!
    $filters: [EventObjectType!]
  ) {
    unsubscribe(subscriptionId: $subscriptionId, filters: $filters) {
      ...subInfo
    }
  }

  ${subInfo}
`

type UnsubscribeDocumentData = {
  unsubscribe?: {
    id: string
    filters?: EventObjectType[]
    active: boolean
  }
}

type UnsubscribeDocumentVariables = {
  subscriptionId: string
  filters?: EventObjectType[]
}

const useUnsubscribeDocumentMutation = makeMutationHook<
  UnsubscribeDocumentData,
  UnsubscribeDocumentVariables
>(UNSUBSCRIBE_DOCUMENT_MUTATION)

export default useUnsubscribeDocumentMutation
