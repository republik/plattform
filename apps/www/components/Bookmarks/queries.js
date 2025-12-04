import { gql } from '@apollo/client'
import { documentFragment } from '../Feed/fragments'

const variablesAsJSONStrings = []

export const getRefetchQueries = () =>
  variablesAsJSONStrings.map((string) => ({
    query: getCollectionItems,
    variables: JSON.parse(string),
  }))

export const registerQueryVariables = (variables) => {
  const string = JSON.stringify(variables)
  if (!variablesAsJSONStrings.includes(string)) {
    variablesAsJSONStrings.push(string)
  }
}

export const getCollectionItems = gql`
  query getCollectionItems(
    $cursor: String
    $collections: [String!]!
    $progress: ProgressState
    $lastDays: Int
  ) {
    me {
      id
      collectionItems(
        names: $collections
        first: 10
        after: $cursor
        progress: $progress
        uniqueDocuments: true
        lastDays: $lastDays
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          createdAt
          document {
            ...FeedDocument
          }
        }
      }
    }
  }
  ${documentFragment}
`
