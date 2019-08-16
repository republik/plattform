import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { ActiveDebateComment, ActiveDebateHeader } from '.'
import colors from '../../theme/colors'
import { Header as UserProfile } from '../Discussion/Internal/Comment'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'

const styles = {
  root: css({
    borderTop: `1px solid #C8C8C8`,
    margin: '0 0 30px 0',
    paddingTop: 10
  }),
  footer: css({
    ...sansSerifRegular14,
    display: 'flex',
    justifyContent: 'flex-start'
  }),
  profilePicture: css({
    display: 'block',
    width: `40px`,
    flex: `0 0 40px`,
    height: `40px`,
    marginRight: '8px'
  }),
  commentMeta: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start'
  }),
  authorName: css({
    flexShrink: 0,
    paddingLeft: 10,
    color: colors.text,
    ...sansSerifMedium16
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    paddingLeft: 10
  })
}

export const DebateTeaser = ({
  t,
  path,
  documentTitle,
  commentCount,
  comments
}) => {
  return (
    <div {...styles.root}>
      <ActiveDebateHeader
        t={t}
        documentTitle={documentTitle}
        commentCount={commentCount}
        href={path}
      />
      {comments.map(comment => (
        <React.Fragment key={comment.id}>
          <ActiveDebateComment
            t={t}
            id={comment.id}
            highlight={comment.highlight ? comment.highlight : undefined}
            preview={comment.preview}
          />
          <UserProfile t={t} comment={comment} isExpanded={true} />
        </React.Fragment>
      ))}
    </div>
  )
}

export default DebateTeaser

DebateTeaser.propTypes = {
  t: PropTypes.func,
  path: PropTypes.string,
  documentTitle: PropTypes.string,
  commentCount: PropTypes.number,
  comments: PropTypes.array
}
