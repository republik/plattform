import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { ellipsize } from '../../lib/styleMixins'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center'
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%'
  }),
  title: css({
    ...ellipsize,
    ...sansSerifMedium16,
    lineHeight: '19px',
    color: colors.text
  }),
  description: css({
    ...ellipsize,
    ...sansSerifRegular14,
    color: colors.text
  })
}


export const CommentContext = ({
  onClick,
  title,
  description
}) => {
  return (
    <div {...styles.root}>
      <div {...styles.meta}>
        <div {...styles.title} onClick={onClick} style={{cursor: onClick ? 'pointer' : undefined}}>
          {title}
        </div>
        {description && (
          <div {...styles.description}>
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentContext
