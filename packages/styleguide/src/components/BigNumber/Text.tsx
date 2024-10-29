import React from 'react'
import { serifBold28, serifBold42 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'

const baseStyle = {
  ...convertStyleToRem(serifBold28),
}

const styles = {
  text: css({
    ...baseStyle,
    [mUp]: {
      ...convertStyleToRem(serifBold42),
    },
  }),
}

export const Text = ({ children, attributes }) => {
  return (
    <div
      {...attributes}
      {...styles.text}
    >
      {children}
    </div>
  )
}

export default Text
