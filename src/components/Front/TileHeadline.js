import React from 'react'
import { css } from 'glamor'
import { mUp } from './mediaQueries'
import { serifTitle20, sansSerifMedium20 } from '../Typography/styles'

const smallSize = {
  fontSize: '26px',
  lineHeight: '28px',
  marginBottom: '16px'
}

const mediumSize = {
  fontSize: '32px',
  lineHeight: '34px',
  marginBottom: '25px'
}

const styles = {
  base: css({
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8
    }
  }),
  editorial: css({
    ...serifTitle20,
    ...smallSize,
    [mUp]: {
      ...mediumSize
    }
  }),
  interaction: css({
    ...sansSerifMedium20,
    ...smallSize,
    [mUp]: {
      ...mediumSize
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
