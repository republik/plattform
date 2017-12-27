module.exports.level1 = `
  query discussion(
    $discussionId: ID!
    $first: Int
    $orderBy: DiscussionOrder
    $orderDirection: OrderDirection
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
          hottnes
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
