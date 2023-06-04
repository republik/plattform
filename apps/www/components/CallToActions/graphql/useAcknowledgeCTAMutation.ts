import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { CallToAction } from './CallToAction'

const ACKNOWLEDGE_CTA_MUTATION = gql`
  mutation acknowledgeCTA($id: ID!, $response: JSON) {
    acknowledgeCallToAction(id: $id, response: $response) {
      id
      beginAt
      endAt
      acknowledgedAt
      updatedAt
      createdAt
      payload {
        customComponent {
          key
          args
        }
      }
      response
    }
  }
`

type AcknowledgeCTAMutation = {
  data: {
    acknowledgeCallToAction: CallToAction
  }
  variables: {
    id: string
    response: Record<string, unknown>
  }
}

/**
 * Acknowledge a CallToAction for the current user
 * @param id
 * @param response
 */
export const useAcknowledgeCTAMutation = makeMutationHook<
  AcknowledgeCTAMutation['data'],
  AcknowledgeCTAMutation['variables']
>(ACKNOWLEDGE_CTA_MUTATION)
