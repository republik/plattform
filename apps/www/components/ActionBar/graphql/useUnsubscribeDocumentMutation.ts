import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

const UNSUBSCRIBE_DOCUMENT_MUTATION = gql`
  mutation unsubscribeDocumentMutation($subscriptionId: ID!) {
    unsubscribe(subscriptionId: $subscriptionId) {
      id
    }
  }
`

type UnsubscribeDocumentData = {
  unsubscribe?: {
    id: string
  }
}

type UnsubscribeDocumentVariables = {
  subscriptionId: string
}

const useUnsubscribeDocumentMutation = makeMutationHook<
  UnsubscribeDocumentData,
  UnsubscribeDocumentVariables
>(UNSUBSCRIBE_DOCUMENT_MUTATION)

export default useUnsubscribeDocumentMutation
