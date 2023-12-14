import { gql } from '@apollo/client'

export const ACKNOWLEDGE_CTA_MUTATION = gql`
  mutation acknowledgeCTA($id: ID!, $response: JSON) {
    acknowledgeCallToAction(id: $id, response: $response) {
      id
      acknowledgedAt
    }
  }
`

export type AcknowledgeCTAMutationResult = {
  acknowledgeCallToAction: { id: string; acknowledgedAt: string }
}

export type AcknowledgeCTAMutationVariables = {
  id: string
  response: Record<string, unknown>
}
