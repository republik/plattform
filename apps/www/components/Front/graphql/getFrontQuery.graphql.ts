import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

type FrontQueryVariables = {
  path: string
  first: number
  after?: string
  before?: string
  only?: string
}

export const FRONT_QUERY = gql`
  query getFront(
    $path: String!
    $first: Int!
    $after: ID
    $before: ID
    $only: ID
  ) {
    front: document(path: $path) {
      id
      children(first: $first, after: $after, before: $before, only: $only) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        nodes {
          id
          body
        }
      }
      meta {
        path
        title
        description
        image
        facebookDescription
        facebookImage
        facebookTitle
        twitterDescription
        twitterImage
        twitterTitle
        prepublication
        lastPublishedAt
      }
    }
  }
`

export const useGetFrontQuery = makeQueryHook<any, FrontQueryVariables>(
  FRONT_QUERY,
)
