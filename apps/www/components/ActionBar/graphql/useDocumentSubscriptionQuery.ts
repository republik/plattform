import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import EventObjectType from './EventObjectType'

const MY_DOCUMENT_SUBSCRIPTION_QUERY = gql`
  query getDocumentSubscriptions($path: String!, $onlyMe: Boolean) {
    document(path: $path) {
      id
      subscriptions: subscribedBy(onlyMe: $onlyMe) {
        nodes {
          id
          isEligibleForNotifications
          filters
          active
          object {
            ... on Document {
              id
            }
          }
        }
      }
    }
  }
`

type DocumentSubscriptionData = {
  document: {
    id: string
    subscriptions: {
      nodes: {
        id: string
        filters?: EventObjectType[]
        active: boolean
        object?: {
          id: string
        }
      }[]
    }
  }
}

type DocumentSubscriptionVariables = {
  path: string
  onlyMe?: boolean
}

const useDoucmentSubcriptionQuery = makeQueryHook<
  DocumentSubscriptionData,
  DocumentSubscriptionVariables
>(MY_DOCUMENT_SUBSCRIPTION_QUERY)

export default useDoucmentSubcriptionQuery
