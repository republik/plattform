import React from 'react'
import { serifBold24, serifBold28, serifBold42 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const baseStyle = {
  ...convertStyleToRem(serifBold24),
}

const styles = {
  default: css({
    ...baseStyle,
    [mUp]: {
      ...convertStyleToRem(serifBold28),
    },
  }),
  large: css({
    ...baseStyle,
    [mUp]: {
      ...convertStyleToRem(serifBold42),
    },
  }),
}

type TextProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'div'>
  size?: keyof typeof styles
}

export const Text = ({ children, attributes, size = 'default' }: TextProps) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...attributes}
      {...colorScheme.set('color', 'text')}
      {...styles[size]}
    >
      {children}
    </div>
  )
}

export default Text
