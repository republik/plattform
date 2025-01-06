import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { CallToAction } from './CallToAction'

const CALL_TO_ACTIONS_QUERY = gql`
  query myCallToActions {
    me {
      id
      callToActions {
        id
        beginAt
        endAt
        acknowledgedAt
        payload {
          ... on CallToActionBasicPayload {
            text
            linkHref
            linkLabel
            backgroundColor
            textColor
            illustration
          }
          ... on CallToActionComponentPayload {
            customComponent {
              key
              args
            }
          }
        }
      }
    }
  }
`

type CallToActionsQuery = {
  data: {
    me: {
      id: string
      callToActions: CallToAction[]
    }
  }
  variables: Record<string, unknown>
}

/**
 * Load all CallToActions for the current user
 * that have not been acknowledged yet
 */
export const useCallToActionsQuery = makeQueryHook<
  CallToActionsQuery['data'],
  CallToActionsQuery['variables']
>(CALL_TO_ACTIONS_QUERY)
