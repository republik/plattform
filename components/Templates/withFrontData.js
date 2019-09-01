import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const feedQuery = gql`
query getFrontFeed($filters: [SearchGenericFilterInput!], $minPublishDate: DateRangeInput) {
  feed: search(
    filters: $filters, 
    filter: {
      feed: true,
      publishedAt: $minPublishDate
    },
    sort: {key: publishedAt, direction: DESC},
    first: 2
  ) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      entity {
        ... on Document {
          id
          meta {
            credits
            shortTitle
            title
            description
            publishDate
            prepublication
            path
            kind
            template
            color
            format {
              id
              meta {
                path
                title
                color
                kind
              }
            }
          }
        }
      }
    }
  }
}
`

export const withFeedData = graphql(feedQuery, {
  options: ({ priorRepoIds, excludeRepoIds: excludeRepoIdsCS = '', minPublishDate }) => {
    const excludeRepoIds = [
      ...priorRepoIds,
      ...excludeRepoIdsCS.split(',')
    ].filter(Boolean)
    return {
      variables: {
        minPublishDate: minPublishDate && {
          from: minPublishDate
        },
        filters: [
          { key: 'template', not: true, value: 'format' },
          { key: 'template', not: true, value: 'front' }
        ].concat(excludeRepoIds.map(repoId => ({
          key: 'repoId', not: true, value: repoId
        })))
      }
    }
  }
})

const discussionQuery = gql`
query getFrontDiscussions($lastDays: Int!, $first: Int!, $highlightId: ID) {
  highlight: comments(first: 1, focusId: $highlightId) {
    id
    focus {
      id
      displayAuthor {
        id
        ...AuthorMetaData
      }
      createdAt
      updatedAt
      discussion {
        id
        ...DiscussionMetaData
        comments(first: 0) {
          totalCount
        }
      }
    }
  }
  activeDiscussions(lastDays: $lastDays, first: $first) {
    discussion {
      id
      ...DiscussionMetaData
      comments(first: 3) {
        totalCount
        nodes {
          id
          preview(length: 240) {
            string
            more
          }
          displayAuthor {
            id
            ...AuthorMetaData
          }
          createdAt
          updatedAt
        }
      }
    }
  }
}

fragment AuthorMetaData on DisplayUser {
  id
  name
  slug
  credential {
    description
    verified
  }
  profilePicture
}

fragment DiscussionMetaData on Discussion {
  id
  title
  path
  closed
  document {
    id
    meta {
      title
      path
      template
      ownDiscussion {
        id
        closed
      }
    }
  }
}
`

export const withDiscussionsData = graphql(discussionQuery, {
  options: ({ lastDays = 3, first = 4, highlightId }) => ({
    variables: {
      lastDays: +lastDays,
      first: +first,
      highlightId
    }
  }),
  props: ({ data, ownProps: { highlightQuote, first = 4 } }) => {
    let discussions
    if (!data.loading && !data.error) {
      discussions = data.activeDiscussions.map(a => a.discussion)
      const hasHighlight = !!data.highlight.focus
      if (hasHighlight) {
        const highlightComment = {
          ...data.highlight.focus,
          highlight: highlightQuote,
          discussion: undefined
        }
        // ensure first discussion is the one with the highlight
        let highlightDiscussion = discussions.find(d => d.id === data.highlight.focus.discussion.id)
        if (highlightDiscussion) {
          discussions.splice(discussions.indexOf(highlightDiscussion), 1)
        } else {
          highlightDiscussion = data.highlight.focus.discussion
        }
        discussions.unshift({
          ...highlightDiscussion,
          comments: {
            totalCount: highlightDiscussion.comments.totalCount,
            nodes: [highlightComment].concat(highlightDiscussion.comments.nodes || [])
          }
        })
      }

      const seenNames = new Set()
      let remainingComments = +first + hasHighlight

      discussions = discussions.reduce(
        (all, discussion, i) => {
          let remainingCommentsPerDiscussion = i === 0 ? 2 : 1
          // get comments from never before seen names
          // - max 5 in total
          // - max 2 for first discussion, max 1 for the rest
          const nodes = discussion.comments.nodes.filter(comment => {
            if (!remainingComments || !remainingCommentsPerDiscussion || seenNames.has(comment.displayAuthor.name)) {
              return false
            }
            seenNames.add(comment.displayAuthor.name)
            remainingComments -= 1
            remainingCommentsPerDiscussion -= 1
            return true
          })

          if (nodes.length) {
            all.push({
              ...discussion,
              comments: {
                ...discussion.comments,
                nodes
              }
            })
          }

          return all
        },
        []
      )
    }
    return {
      data: {
        loading: data.loading,
        error: data.error,
        discussions
      }
    }
  }
})
