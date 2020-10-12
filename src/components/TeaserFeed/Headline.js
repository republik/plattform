import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import {
  serifTitle20,
  serifTitle22,
  sansSerifMedium20,
  sansSerifMedium22,
  cursiveTitle20,
  cursiveTitle22
} from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  base: css({
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8
    }
  }),
  editorial: css({
    ...convertStyleToRem(serifTitle20),
    [mUp]: {
      ...convertStyleToRem(serifTitle22)
    }
  }),
  interaction: css({
    ...convertStyleToRem(sansSerifMedium20),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium22),
      lineHeight: pxToRem(24)
    }
  }),
  scribble: css({
    ...convertStyleToRem(cursiveTitle20),
    [mUp]: {
      ...convertStyleToRem(cursiveTitle22)
    }
  })
}

export const Editorial = ({ children, cssColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.editorial}
      {...colorScheme.getColorRule('color', cssColor)}
    >
      {children}
    </h1>
  )
}

export const Interaction = ({ children, cssColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.interaction}
      {...colorScheme.getColorRule('color', cssColor)}
    >
      {children}
    </h1>
  )
}

export const Scribble = ({ children, cssColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.scribble}
      {...colorScheme.getColorRule('color', cssColor)}
    >
      {children}
    </h1>
  )
}
