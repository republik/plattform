import React from 'react'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  caption: css({
    display: 'block',
    ...convertStyleToRem(sansSerifRegular14),
    marginTop: '18px',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
      marginTop: '21px',
    },
    fontStyle: 'normal',
  }),
}

export const Text = ({ children, attributes }) => {
  return (
    <div
      {...attributes}
      {...styles.caption}
    >
      {children}
    </div>
  )
}

export default Text
