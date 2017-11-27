import React from 'react'
import { css } from 'glamor'
import { mUp } from './mediaQueries'
import {
  serifTitle20,
  serifTitle58,
  sansSerifMedium20,
  sansSerifMedium58
} from '../Typography/styles'

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
    fontSize: '38px',
    lineHeight: '43px',
    marginBottom: '30px',
    [mUp]: {
      ...serifTitle58
    }
  }),
  interaction: css({
    ...sansSerifMedium20,
    fontSize: '38px',
    lineHeight: '43px',
    marginBottom: '30px',
    [mUp]: {
      ...sansSerifMedium58
    }
  })
}


export const Editorial = ({ children, poster, large, medium }) => {
  return (
    <h1 {...styles.base} {...styles.editorial}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children, large, medium, small }) => {
  const sizeStyle = (large && styles.large) || (medium && styles.medium) || {}
  return (
    <h1
      {...styles.base}
      {...styles.interaction}
      {...css(styles.default, sizeStyle)}
    >
      {children}
    </h1>
  )
}
