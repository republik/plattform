import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { link, sansSerifRegular14 } from '../Typography/styles'

const styles = {
  root: css({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }),
  default: css({
    ...sansSerifRegular14,
    color: colors.lightText
  }),
  link: css({
    ...link
  })
}

export const CommentTeaserFooter = ({ t, timeago, commentUrl }) => (
  <div {...styles.root}>
    {timeago && <div {...styles.default}>{timeago}</div>}
    {commentUrl && (
      <div {...styles.default}>
        <a href={commentUrl} {...styles.link}>
          {t('styleguide/CommentTeaser/commentLink')}
        </a>
      </div>
    )}
  </div>
)

export default CommentTeaserFooter
