import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import {
  serifTitle20,
  serifTitle22,
  sansSerifMedium20,
  sansSerifMedium22,
  cursiveTitle20,
  cursiveTitle22
} from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  base: css({
    color: colors.text,
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8,
    }
  }),
  editorial: css({
    ...convertStyleToRem(serifTitle20),
    [mUp]: {
      ...convertStyleToRem(serifTitle22),
    }
  }),
  interaction: css({
    ...convertStyleToRem(sansSerifMedium20),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium22),
      lineHeight: '24px'
    }
  }),
  scribble: css({
    ...convertStyleToRem(cursiveTitle20),
    [mUp]: {
      ...convertStyleToRem(cursiveTitle22),
    }
  })
}

export const Editorial = ({ children, style }) => 
  <h1 {...styles.base} {...styles.editorial} style={style}>{children}</h1>

export const Interaction = ({ children, style }) => 
  <h1 {...styles.base} {...styles.interaction} style={style}>{children}</h1>

export const Scribble = ({ children, style }) => 
  <h1 {...styles.base} {...styles.scribble} style={style}>{children}</h1>
