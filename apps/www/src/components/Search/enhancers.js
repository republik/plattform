import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { documentFragment } from '../Feed/fragments'
import { DEFAULT_FILTERS, DEFAULT_AGGREGATION_KEYS } from './constants'

const getSearchAggregations = gql`
  query getSearchAggregations(
    $searchQuery: String
    $keys: [String!]
    $filters: [SearchGenericFilterInput!]
  ) {
    search(first: 0, search: $searchQuery, filters: $filters) {
      totalCount
      aggregations(keys: $keys) {
        key
        count
        label
        buckets {
          value
          count
          label
        }
      }
    }
  }
`

const getSearchResults = gql`
  query getSearchResults(
    $searchQuery: String
    $after: String
    $sort: SearchSortInput
    $filters: [SearchGenericFilterInput!]
  ) {
    search(
      first: 25
      after: $after
      search: $searchQuery
      sort: $sort
      filters: $filters
    ) {
      totalCount
      aggregations {
        key
        count
        label
        buckets {
          value
          count
          label
        }
      }
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
      nodes {
        entity {
          __typename
          ... on Document {
            ...FeedDocument
          }
          ... on Comment {
            id
            content
            text
            preview(length: 240) {
              string
              more
            }
            createdAt
            displayAuthor {
              id
              name
              slug
              profilePicture
              credential {
                id
                description
                verified
              }
            }
            published
            updatedAt
            tags
            parentIds
            discussion {
              id
              title
              path
              document {
                id
                meta {
                  title
                  path
                  template
                  ownDiscussion {
                    id
                    path
                    closed
                  }
                }
              }
            }
          }
          ... on User {
            id
            slug
            firstName
            lastName
            credentials {
              verified
              description
              isListed
            }
            portrait
          }
        }
        highlights {
          path
          fragments
        }
        score
      }
    }
  }
  ${documentFragment}
`

export const withAggregations = graphql(getSearchAggregations, {
  options: (props) => ({
    variables: {
      searchQuery: props.searchQuery || props.urlQuery,
      keys: DEFAULT_AGGREGATION_KEYS,
      filters: DEFAULT_FILTERS,
    },
  }),
  props: ({ data }) => ({
    dataAggregations: data,
  }),
})

export const withResults = graphql(getSearchResults, {
  skip: (props) => props.startState,
  options: (props) => ({
    variables: {
      searchQuery: props.urlQuery,
      sort: props.urlSort,
      filters: DEFAULT_FILTERS.concat(props.urlFilter),
    },
  }),
  props: ({ data, ownProps }) => ({
    data,
    fetchMore: ({ after }) =>
      data.fetchMore({
        variables: {
          after,
          sort: ownProps.sort,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const nodes = [
            ...previousResult.search.nodes,
            ...fetchMoreResult.search.nodes,
          ]
          return {
            ...previousResult,
            totalCount: fetchMoreResult.search.pageInfo.hasNextPage
              ? fetchMoreResult.search.totalCount
              : nodes.length,
            search: {
              ...previousResult.search,
              ...fetchMoreResult.search,
              nodes,
            },
          }
        },
      }),
  }),
})
