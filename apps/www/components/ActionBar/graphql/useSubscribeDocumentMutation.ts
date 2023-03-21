import { gql } from '@apollo/client'
import EventObjectType from './EventObjectType'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { subInfo } from '../../Notifications/enhancers'

const SUBSCRIBE_DOCUMENT_MUTATION = gql`
  mutation subscribeDocumentMutation(
    $documentId: ID!
    $filters: [EventObjectType!]
  ) {
    subscription: subscribe(
      objectId: $documentId
      type: Document
      filters: $filters
    ) {
      ...subInfo
    }
  }

  ${subInfo}
`

type SubscribeDocumentData = {
  subscription: {
    id: string
    filters?: EventObjectType[]
    active: boolean
    object?: {
      id: string
    }
  }
}

type SubscribeDocumentVariables = {
  documentId: string
  filters?: EventObjectType[]
}

const useSubscribeDocumentMutation = makeMutationHook<
  SubscribeDocumentData,
  SubscribeDocumentVariables
>(SUBSCRIBE_DOCUMENT_MUTATION)

export default useSubscribeDocumentMutation
