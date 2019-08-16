import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import { ActiveDebateTeaser } from '.'
import { TeaserFrontSectionTitle } from '../TeaserSharedComponent'
const styles = {
  section: css({
    margin: 0,
    padding: '30px 15px',
    backgroundColor: '#FFFFFF',
    color: '#000000'
  }),
  row: css({}),
  withoutHighlight: css({
    [mUp]: {
      columns: '2 auto',
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

const ActiveDebates = ({ discussions, hasHighlight = false, t, children }) => {
  if (hasHighlight) {
    const highlighted = discussions.filter(discussion =>
      discussion.comments.nodes.some(comment =>
        comment.hasOwnProperty('highlight')
      )
    )
    const notHighlighted = discussions.filter(
      discussion =>
        !discussion.comments.nodes.some(comment =>
          comment.hasOwnProperty('highlight')
        )
    )

    return (
      <section {...styles.section}>
        {children}
        <div role="group" {...css(styles.row, styles.withHighlight)}>
          <div {...styles.left}>
            {highlighted.map(discussion => (
              <ActiveDebateTeaser
                key={discussion.id}
                t={t}
                path={discussion.path}
                documentId={discussion.id}
                documentTitle={discussion.title}
                commentCount={discussion.comments.totalCount}
                comments={discussion.comments.nodes}
              />
            ))}
          </div>
          <div {...styles.right}>
            {notHighlighted.map(discussion => (
              <ActiveDebateTeaser
                key={discussion.id}
                t={t}
                path={discussion.path}
                documentId={discussion.id}
                documentTitle={discussion.title}
                commentCount={discussion.comments.totalCount}
                comments={discussion.comments.nodes}
              />
            ))}
          </div>
        </div>
      </section>
    )
  } else {
    return (
      <section {...styles.section}>
        {children}
        <div role="group" {...css(styles.row, styles.withoutHighlight)}>
          {discussions.map(discussion => (
            <ActiveDebateTeaser
              key={discussion.id}
              t={t}
              path={discussion.path}
              documentId={discussion.id}
              documentTitle={discussion.title}
              commentCount={discussion.comments.totalCount}
              comments={discussion.comments.nodes}
            />
          ))}
        </div>
      </section>
    )
  }
}

export default ActiveDebates

ActiveDebates.propTypes = {
  hasHighlight: PropTypes.bool,
  discussions: PropTypes.array,
  children: PropTypes.node
}
