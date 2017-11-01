import React from 'react'
import { css, merge } from 'glamor'
import colors from '../../theme/colors'
import { serifRegular14 } from '../Typography/styles'
import CommentHeader from '../Comment/CommentHeader'
import CommentTeaserHeader from './CommentTeaserHeader'
import CommentTeaserFooter from './CommentTeaserFooter'

const styles = {
  root: {
    marginBottom: '10px',
    '& + &': {
      borderTop: `1px solid ${colors.divider}`,
      paddingTop: '20px'
    }
  },
  body: {
    ...serifRegular14,
    margin: '10px 0'
  },
  clamp: {
    // TODO: Replace with a cross-browser JS solution for line-clamping.
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical'
  },
  box: {
    border: `1px solid ${colors.divider}`,
    padding: '20px'
  }
}

export const CommentTeaser = ({
  t,
  title,
  subtitle,
  displayAuthor,
  content,
  timeago,
  commentUrl,
  lineClamp,
  isBox
}) => (
  <div {...css(merge(styles.root, isBox ? styles.box : {}))}>
    {displayAuthor ? (
      <CommentHeader {...displayAuthor} />
    ) : (
      <CommentTeaserHeader title={title} subtitle={subtitle} />
    )}
    <div
      {...css(
        merge(
          styles.body,
          lineClamp ? merge(styles.clamp, { WebkitLineClamp: lineClamp }) : {}
        )
      )}
    >
      {content}
    </div>
    <CommentTeaserFooter commentUrl={commentUrl} timeago={timeago} t={t} />
  </div>
)

export default CommentTeaser
