import { gql } from './gql'

export const CALL_TO_ACTIONS_QUERY = gql(`
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
`)
