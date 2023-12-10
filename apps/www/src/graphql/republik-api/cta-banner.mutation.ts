import { gql } from './gql'

export const ACKNOWLEDGE_CTA_MUTATION = gql(`
  mutation acknowledgeCTA($id: ID!, $response: JSON) {
    acknowledgeCallToAction(id: $id, response: $response) {
      id
      acknowledgedAt
    }
  }
`)
