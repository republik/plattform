import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import { ActiveDebateTeaser } from '.'

const styles = {
  section: css({
    margin: '0 auto',
    maxWidth: 1300,
    padding: '40px 15px 10px',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    [mUp]: {
      padding: '50px 15px 40px'
    }
  }),
  row: css({}),
  withoutHighlight: css({
    [mUp]: {
      columns: '2 auto',
      columnGap: 30,
      '> *': { breakInside: 'avoid-column' }
    }
  }),
  withHighlight: css({
    [mUp]: {
      display: 'flex'
    }
  }),
  left: css({
    [mUp]: {
      width: '50%',
      flexGrow: 1,
      marginRight: 16
    }
  }),
  right: css({
    [mUp]: {
      width: '50%',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      marginLeft: 16
    }
  })
}

const ActiveDebates = ({
  discussions,
  t,
  CommentLink,
  DiscussionLink,
  children
}) => {
  const highlighted = discussions.filter(discussion =>
    discussion.comments.nodes.some(comment =>
      comment.hasOwnProperty('highlight')
    )
  )
  if (highlighted.length) {
    const notHighlighted = discussions.filter(
      discussion =>
        !discussion.comments.nodes.some(comment =>
          comment.hasOwnProperty('highlight')
        )
    )

    return (
      <section {...styles.section}>
        {children}
        <div role='group' {...css(styles.row, styles.withHighlight)}>
          <div {...styles.left}>
            {highlighted.map(discussion => (
              <ActiveDebateTeaser
                key={discussion.id}
                discussion={discussion}
                CommentLink={CommentLink}
                DiscussionLink={DiscussionLink}
                t={t}
              />
            ))}
          </div>
          <div {...styles.right}>
            {notHighlighted.map(discussion => (
              <ActiveDebateTeaser
                key={discussion.id}
                discussion={discussion}
                CommentLink={CommentLink}
                DiscussionLink={DiscussionLink}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>
    )
  } 
  return (
    <section {...styles.section}>
      {children}
      <div role='group' {...css(styles.row, styles.withoutHighlight)}>
        {discussions.map(discussion => (
          <ActiveDebateTeaser
            key={discussion.id}
            discussion={discussion}
            CommentLink={CommentLink}
            DiscussionLink={DiscussionLink}
            t={t}
          />
        ))}
      </div>
    </section>
  )
}

export default ActiveDebates

ActiveDebates.propTypes = {
  discussions: PropTypes.array,
  children: PropTypes.node
}

ActiveDebates.data = {
  config: {
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
            let remainingCommentsPerDiscussion = 1
            // get comments from never before seen names
            // - max 5 in total
            // - max 1 per discussion
            // - maybe eventually we could do «max 2 for first discussion, max 1»
            //   «i === 0 ? 2 : 1» here but needs spacing fine tuning
            const nodes = discussion.comments.nodes.filter(comment => {
              if ((!comment.preview && !comment.highlight) || !remainingComments || !remainingCommentsPerDiscussion || seenNames.has(comment.displayAuthor.name)) {
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
  },
  query: `
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
}
