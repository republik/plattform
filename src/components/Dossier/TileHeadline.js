import React from 'react'
import { css } from 'glamor'
import { tUp } from '../TeaserFront/mediaQueries'
import {
  serifTitle26,
  serifTitle32,
  cursiveTitle26,
  cursiveTitle32,
  sansSerifMedium26,
  sansSerifMedium32
} from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  base: css({
    margin: 0,
    hyphens: 'auto',
    marginBottom: '16px',
    [tUp]: {
      marginBottom: '25px'
    }
  }),
  editorial: css({
    ...convertStyleToRem(serifTitle26),
    [tUp]: {
      ...convertStyleToRem(serifTitle32)
    }
  }),
  interaction: css({
    ...convertStyleToRem(sansSerifMedium26),
    [tUp]: {
      ...convertStyleToRem(sansSerifMedium32)
    }
  }),
  scribble: css({
    ...convertStyleToRem(cursiveTitle26),
    [tUp]: {
      ...convertStyleToRem(cursiveTitle32)
    }
  })
}

export const Editorial = ({ children }) => {
  return (
    <h1 {...styles.base} {...styles.editorial}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children }) => {
  return (
    <h1 {...styles.base} {...styles.interaction}>
      {children}
    </h1>
  )
}

export const Scribble = ({ children }) => {
  return (
    <h1 {...styles.base} {...styles.scribble}>
      {children}
    </h1>
  )
}
