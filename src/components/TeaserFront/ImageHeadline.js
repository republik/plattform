import React from 'react'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import { serifTitle58, sansSerifMedium58 } from '../Typography/styles'

const baseSize = {
  fontSize: '38px',
  lineHeight: '43px',
  [mUp]: {
    fontSize: '58px',
    lineHeight: '60px'
  }
}

const styles = {
  base: css({
    margin: '0 0 30px 0'
  }),
  editorial: css({
    ...serifTitle58
  }),
  interaction: css({
    ...sansSerifMedium58
  }),
  small: css({
    ...baseSize
  }),
  large: css({
    ...baseSize,
    [tUp]: {
      fontSize: '125px',
      lineHeight: '137px'
    }
  }),
  medium: css({
    ...baseSize,
    [tUp]: {
      fontSize: '100px',
      lineHeight: '110px'
    }
  }),
  default: css({
    ...baseSize,
    [tUp]: {
      fontSize: '80px',
      lineHeight: '90px'
    }
  })
}

export const Editorial = ({ children, small, large, medium }) => {
  const sizeStyle =
    (large && styles.large) ||
    (medium && styles.medium) ||
    (small && styles.small) ||
    styles.default
  return (
    <h1 {...styles.base} {...styles.editorial} {...sizeStyle}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children, small, large, medium }) => {
  const sizeStyle =
    (large && styles.large) ||
    (medium && styles.medium) ||
    (small && styles.small) ||
    styles.default
  return (
    <h1 {...styles.base} {...styles.interaction} {...sizeStyle}>
      {children}
    </h1>
  )
}
