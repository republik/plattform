import React from 'react'
import { css } from 'glamor'
import { tUp } from '../TeaserFront/mediaQueries'
import {
  serifTitle26,
  serifTitle32,
  sansSerifMedium26,
  sansSerifMedium32
} from '../Typography/styles'

const styles = {
  base: css({
    margin: 0,
    marginBottom: '16px',
    [tUp]: {
      marginBottom: '25px'
    }
  }),
  editorial: css({
    ...serifTitle26,
    [tUp]: {
      ...serifTitle32
    }
  }),
  interaction: css({
    ...sansSerifMedium26,
    [tUp]: {
      ...sansSerifMedium32
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
