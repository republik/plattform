import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

const ACKNOWLEDGE_CTA_MUTATION = gql`
  mutation acknowledgeCTA($id: ID!, $response: JSON) {
    acknowledgeCallToAction(id: $id, response: $response) {
      id
      acknowledgedAt
    }
  }
`

type AcknowledgeCTAMutation = {
  data: {
    acknowledgeCallToAction: { id: string; acknowledgedAt: string }
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
