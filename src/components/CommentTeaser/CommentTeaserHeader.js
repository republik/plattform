import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'
import { ellipsize } from '../../lib/styleMixins'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column'
  }),
  title: css({
    ...sansSerifMedium16,
    color: colors.text,
    ...ellipsize
  }),
  subtitle: css({
    ...sansSerifRegular14,
    color: colors.lightText,
    lineHeight: 1.1,
    ...ellipsize
  })
}

export const CommentTeaserHeader = ({ t, title, subtitle }) => (
  <div {...styles.root}>
    <div {...styles.title}>{title}</div>
    {subtitle && <div {...styles.subtitle}>{subtitle}</div>}
  </div>
)

export default CommentTeaserHeader
