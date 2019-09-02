import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import { ActiveDebateTeaser } from '.'

const styles = {
  section: css({
    margin: '0 auto',
    maxWidth: 1300,
    padding: '40px 15px',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    [mUp]: {
      padding: '70px 15px'
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
