import { css } from 'glamor'
import React from 'react'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import {
  cursiveTitle20,
  cursiveTitle22,
  sansSerifMedium20,
  sansSerifMedium22,
  serifTitle20,
  serifTitle22,
} from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'

const styles = {
  base: css({
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8,
    },
  }),
  editorial: css({
    ...convertStyleToRem(serifTitle20),
    [mUp]: {
      ...convertStyleToRem(serifTitle22),
    },
  }),
  interaction: css({
    ...convertStyleToRem(sansSerifMedium20),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium22),
      lineHeight: pxToRem(24),
    },
  }),
  scribble: css({
    ...convertStyleToRem(cursiveTitle20),
    [mUp]: {
      ...convertStyleToRem(cursiveTitle22),
    },
  }),
}

export const Editorial = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.editorial}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}

export const Interaction = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.interaction}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}

export const Scribble = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.scribble}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}
