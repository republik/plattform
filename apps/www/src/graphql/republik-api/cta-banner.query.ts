import { gql } from '@apollo/client'

export type CallToAction = {
  id: string
  beginAt: string
  endAt?: string
  acknowledgedAt?: string
  updatedAt: string
  createdAt: string
  payload:
    | {
        __typename: 'CallToActionBasicPayload'
        text: string
        linkHref: string
        linkLabel: string
      }
    | {
        __typename: 'CallToActionComponentPayload'
        customComponent: {
          key: string
          args?: Record<string, unknown>
        }
      }
  response?: unknown
}

export const CALL_TO_ACTIONS_QUERY = gql`
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
`

export type CallToActionsQueryResult = {
  me: {
    id: string
    callToActions: CallToAction[]
  }
}
