import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const getActiveDiscussions = gql`
  query getActiveDiscussions($lastDays: Int!, $first: Int) {
    activeDiscussions(lastDays: $lastDays, first: $first) {
      discussion {
        id
        title
        path
        closed
        document {
          id
          meta {
            title
            image
            audioCover
            path
            template
            ownDiscussion {
              id
              path
              closed
            }
          }
        }
        comments {
          totalCount
        }
      }
    }
  }
`

const getComments = gql`
  query getComments(
    $first: Int!
    $after: String
    $orderBy: DiscussionOrder
    $discussionId: ID
    $discussionIds: [ID!]
    $toDepth: Int
    $lastId: ID
  ) {
    comments(
      first: $first
      after: $after
      orderBy: $orderBy
      discussionId: $discussionId
      discussionIds: $discussionIds
      toDepth: $toDepth
      lastId: $lastId
      orderDirection: DESC
    ) {
      id
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        preview(length: 240) {
          string
          more
        }
        displayAuthor {
          id
          name
          slug
          credential {
            id
            description
            verified
          }
          profilePicture
        }
        updatedAt
        createdAt
        parentIds
        tags
        discussion {
          id
          title
          path
          document {
            id
            meta {
              title
              path
              credits
              template
              ownDiscussion {
                id
                path
                closed
              }
              linkedDiscussion {
                id
                path
                closed
              }
            }
          }
        }
      }
    }
  }
`

export const withActiveDiscussions = graphql(getActiveDiscussions, {
  options: (props) => ({
    variables: {
      lastDays: props.lastDays || 3,
      first: props.first,
    },
  }),
})

export const withComments = (defaultProps = {}) =>
  graphql(getComments, {
    options: ({ discussionId, discussionIds, toDepth, orderBy, first }) => {
      return {
        variables: {
          discussionId,
          discussionIds,
          toDepth,
          orderBy: defaultProps.orderBy || 'DATE',
          first: defaultProps.first || 10,
        },
      }
    },
    props: ({ data, ownProps }) => ({
      data,
      fetchMore: ({ after }) =>
        data.fetchMore({
          variables: {
            after,
          },
          updateQuery: (
            previousResult,
            { fetchMoreResult, queryVariables },
          ) => {
            const nodes = [
              ...previousResult.comments.nodes,
              ...fetchMoreResult.comments.nodes,
            ]
            return {
              ...previousResult,
              totalCount: fetchMoreResult.comments.pageInfo.hasNextPage
                ? fetchMoreResult.comments.totalCount
                : nodes.length,
              comments: {
                ...previousResult.comments,
                ...fetchMoreResult.comments,
                nodes,
              },
            }
          },
        }),
    }),
  })
