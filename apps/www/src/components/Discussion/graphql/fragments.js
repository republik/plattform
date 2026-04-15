import { gql } from '@apollo/client'

export const connectionInfo = gql`
  fragment ConnectionInfo on CommentConnection {
    id
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
`
