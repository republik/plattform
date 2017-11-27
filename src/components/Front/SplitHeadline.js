import React from 'react'
import { css } from 'glamor'
import { mUp, tUp, dUp } from './mediaQueries'
import { serifTitle20, sansSerifMedium20 } from '../Typography/styles'

const sizes = {
  large: css({
    [tUp]: {
      fontSize: '100px',
      lineHeight: '110px'
    },
    [dUp]: {
      fontSize: '125px',
      lineHeight: '135px'
    }
  }),
  medium: css({
    [tUp]: {
      fontSize: '100px',
      lineHeight: '110px'
    }
  }),
  default: css({
    fontSize: '38px',
    lineHeight: '43px',
    [mUp]: {
      fontSize: '60px',
      lineHeight: '70px'
    },
    [tUp]: {
      fontSize: '80px',
      lineHeight: '90px'
    }
  })
}

const styles = {
  base: css({
    margin: '0 0 15px 0',
    [mUp]: {
      marginBottom: '30px'
    }
  }),
  editorial: css({
    ...serifTitle20,
  }),
  interaction: css({
    ...sansSerifMedium20
  })
}

export const Editorial = ({ children, large, medium }) => {
  const sizedStyle = css(
    styles.editorial,
    sizes.default,
    (large && sizes.large) || (medium && sizes.medium) || {}
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children, large, medium }) => {
  const sizedStyle = css(
    styles.interaction,
    sizes.default,
    (large && sizes.large) || (medium && sizes.medium) || {}
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}
