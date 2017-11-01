import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column'
  }),
  title: css({
    ...sansSerifMedium16,
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }),
  subtitle: css({
    ...sansSerifRegular14,
    lineHeight: 1.1,
    color: colors.lightText,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  })
}

export const CommentTeaserHeader = ({ t, title, subtitle }) => (
  <div {...styles.root}>
    <div {...styles.title}>{title}</div>
    {subtitle && <div {...styles.subtitle}>{subtitle}</div>}
  </div>
)

export default CommentTeaserHeader
