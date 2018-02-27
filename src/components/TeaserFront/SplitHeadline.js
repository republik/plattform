import React from 'react'
import { css } from 'glamor'
import { mUp, tUp, dUp } from './mediaQueries'
import { serifTitle20, sansSerifMedium20 } from '../Typography/styles'

const size = {
  s: {
    fontSize: '38px',
    lineHeight: '43px'
  },
  m: {
    fontSize: '60px',
    lineHeight: '70px'
  },
  l: {
    fontSize: '80px',
    lineHeight: '90px'
  },
  xl: {
    fontSize: '100px',
    lineHeight: '110px'
  },
  xxl: {
    fontSize: '125px',
    lineHeight: '135px'
  }
}

const sizes = {
  large: css({
    ...size.s,
    [mUp]: {
      ...size.l
    },
    [tUp]: {
      ...size.xl
    },
    [dUp]: {
      ...size.xxl
    }
  }),
  medium: css({
    ...size.s,
    [mUp]: {
      ...size.m
    },
    [tUp]: {
      ...size.l
    },
    [dUp]: {
      ...size.xl
    }
  }),
  default: css({
    ...size.s,
    [tUp]: {
      ...size.m
    },
    [dUp]: {
      ...size.l
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
    (large && sizes.large) || (medium && sizes.medium) || sizes.default
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
    (large && sizes.large) || (medium && sizes.medium) || sizes.default
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}
