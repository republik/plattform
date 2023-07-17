import EventObjectType from '../../lib/graphql-types/EventObjectType'
import { makeMutationHook } from '../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  subscribeToDocumentMutation,
  unsubscribeFromDocumentMutation,
} from './enhancers'

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

export const useSubscribeDocumentMutation = makeMutationHook<
  SubscribeDocumentData,
  SubscribeDocumentVariables
>(subscribeToDocumentMutation)

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

export const useUnsubscribeDocumentMutation = makeMutationHook<
  UnsubscribeDocumentData,
  UnsubscribeDocumentVariables
>(unsubscribeFromDocumentMutation)
