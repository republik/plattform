module.exports.level1 = `
  query discussion(
    $discussionId: ID!
    $first: Int
    $orderBy: DiscussionOrder
    $orderDirection: OrderDirection
    $after: String
  ){
    discussion(id: $discussionId) {
      id
      title
      rules {
        maxLength
        minInterval
        anonymity
      }
      comments(
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        after: $after
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          parent {
            id
          }
          content
          upVotes
          downVotes
          score
          hotness
          displayAuthor {
            id
          }
          depth
          comments {
            totalCount
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              id
              content
            }
          }
        }
      }
    }
  }
`
