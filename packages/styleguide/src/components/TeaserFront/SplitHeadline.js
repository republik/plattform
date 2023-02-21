import React from 'react'
import { css } from 'glamor'
import { mUp, tUp, dUp } from './mediaQueries'
import { serifTitle20, sansSerifMedium20 } from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'

const size = {
  s: {
    fontSize: pxToRem('38px'),
    lineHeight: pxToRem('43px'),
  },
  sUp: {
    fontSize: pxToRem('58px'),
    lineHeight: pxToRem('60px'),
  },
  m: {
    fontSize: pxToRem('60px'),
    lineHeight: pxToRem('70px'),
  },
  l: {
    fontSize: pxToRem('80px'),
    lineHeight: pxToRem('90px'),
  },
  xl: {
    fontSize: pxToRem('100px'),
    lineHeight: pxToRem('110px'),
  },
  xxl: {
    fontSize: pxToRem('125px'),
    lineHeight: pxToRem('135px'),
  },
}

const sizes = {
  small: css({
    ...size.s,
    [mUp]: {
      ...size.sUp,
    },
  }),
  large: css({
    ...size.s,
    [mUp]: {
      ...size.l,
    },
    [tUp]: {
      ...size.xl,
    },
    [dUp]: {
      ...size.xxl,
    },
  }),
  medium: css({
    ...size.s,
    [mUp]: {
      ...size.m,
    },
    [tUp]: {
      ...size.l,
    },
    [dUp]: {
      ...size.xl,
    },
  }),
  default: css({
    ...size.s,
    [tUp]: {
      ...size.m,
    },
    [dUp]: {
      ...size.l,
    },
  }),
}

const styles = {
  base: css({
    margin: '18px 0 15px 0',
    [mUp]: {
      marginTop: '0px',
    },
  }),
  editorial: css({
    ...convertStyleToRem(serifTitle20),
  }),
  interaction: css({
    ...convertStyleToRem(sansSerifMedium20),
  }),
}

export const Editorial = ({ children, large, medium, small }) => {
  const sizedStyle = css(
    styles.editorial,
    (large && sizes.large) ||
      (medium && sizes.medium) ||
      (small && sizes.small) ||
      sizes.default,
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
    (large && sizes.large) ||
      (medium && sizes.medium) ||
      (small && sizes.small) ||
      sizes.default,
  )
  return (
    <h1 {...styles.base} {...sizedStyle}>
      {children}
    </h1>
  )
}
