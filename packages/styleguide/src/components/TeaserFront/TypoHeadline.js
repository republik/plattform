import React from 'react'
import { css } from 'glamor'
import { mUp, tUp, dUp } from './mediaQueries'
import { MAX_WIDTH_PERCENT } from './Typo'
import { serifTitle20, sansSerifMedium20 } from '../Typography/styles'

// Larger headlines should breakout of the parent's maxWidth container slightly
// so use a fraction of the remaining percentage.
const horizontalBreakout = `-${(100 - MAX_WIDTH_PERCENT) * 0.25}%`
const breakoutMargin = {
  marginLeft: horizontalBreakout,
  marginRight: horizontalBreakout
}

const serifSizes = {
  large: css({
    [tUp]: {
      fontSize: '125px',
      lineHeight: '137px'
    },
    [dUp]: {
      fontSize: '156px',
      lineHeight: '169px'
    }
  }),
  medium: css({
    [tUp]: {
      fontSize: '125px',
      lineHeight: '137px'
    }
  }),
  default: css({
    fontSize: '38px',
    lineHeight: '45px',
    [mUp]: {
      fontSize: '100px',
      lineHeight: '110px',
      ...breakoutMargin
    }
  })
}

const sansSerifSizes = {
  large: css({
    [tUp]: {
      fontSize: '125px',
      lineHeight: '137px'
    },
    [dUp]: {
      fontSize: '156px',
      lineHeight: '169px'
    }
  }),
  medium: css({
    [tUp]: {
      fontSize: '125px',
      lineHeight: '137px'
    }
  }),
  small: css({
    fontSize: '26px',
    lineHeight: '31px',
    [mUp]: {
      fontSize: '50px',
      lineHeight: '57px'
    },
    [tUp]: {
      fontSize: '64px',
      lineHeight: '72px'
    }
  }),
  default: css({
    fontSize: '38px',
    lineHeight: '45px',
    [mUp]: {
      fontSize: '100px',
      lineHeight: '110px',
      ...breakoutMargin
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
    ...serifTitle20
  }),
  interaction: css({
    ...sansSerifMedium20
  })
}

export const Editorial = ({ children, large, medium }) => {
  const sizedStyle = css(
    styles.editorial,
    serifSizes.default,
    (large && serifSizes.large) || (medium && serifSizes.medium) || {}
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children, large, medium, small }) => {
  const sizedStyle = css(
    styles.interaction,
    sansSerifSizes.default,
    (large && sansSerifSizes.large) ||
      (medium && sansSerifSizes.medium) ||
      (small && sansSerifSizes.small) ||
      {}
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}
