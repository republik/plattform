import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import { ActiveDebateTeaser } from '.'

const styles = {
  root: css({
    margin: 0,
    padding: '30px 15px',
    overflow: 'auto',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    [mUp]: {
      flexDirection: 'row'
    }
  }),
  left: css({}),
  right: css({})
}

const ActiveDebates = ({ discussions, hasHighlight = false, t }) => (
  <div role="group" {...styles.root}>
    {discussions.map(discussion => (
      <ActiveDebateTeaser
        t={t}
        path={discussion.path}
        documentId={discussion.id}
        documentTitle={discussion.title}
        commentCount={discussion.comments.totalCount}
        comments={discussion.comments.nodes}
      />
    ))}
    {/* One or two columns based on hasHighlight */}
    {/* <div {...styles.left}>hasHighlight</div>
    <div {...styles.right}>hasHighlight</div> */}
  </div>
)

export default ActiveDebates

ActiveDebates.propTypes = {
  hasHighlight: PropTypes.bool,
  discussions: PropTypes.object
}
