import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'

export const PADDING = 15

export const MAX_WIDTH = 665
// iPhone Plus, for max image sizes
export const MAX_WIDTH_MOBILE = 414 - PADDING * 2

const DEFAULT_MARGIN = 15
export const BREAKOUT = 155 + DEFAULT_MARGIN

const FLOAT_MARGIN = 100
const NARROW_WIDTH = 495
const SMALL_WIDTH = 410
const TINY_WIDTH = 325

const floatStyle = {
  float: 'left',
  minWidth: BREAKOUT,
  maxWidth: NARROW_WIDTH,
  marginTop: FLOAT_MARGIN / 2,
  marginRight: FLOAT_MARGIN,
  marginBottom: FLOAT_MARGIN / 2,
  width: '100%',
  '[data-can-breakout=true] &': {
    marginLeft: -BREAKOUT,
  },
}

export const breakoutUp = `@media only screen and (min-width: ${
  MAX_WIDTH + BREAKOUT * 2 + PADDING * 2 + PADDING
}px)`

export const BREAKOUT_SIZES = {
  narrow: NARROW_WIDTH,
  tiny: TINY_WIDTH,
  breakout: MAX_WIDTH + BREAKOUT * 2,
  breakoutLeft: MAX_WIDTH + BREAKOUT,
  float: NARROW_WIDTH,
  floatSmall: SMALL_WIDTH,
  floatTiny: TINY_WIDTH,
}

export const breakoutStyles = {
  narrow: css({
    margin: '0 auto',
    maxWidth: NARROW_WIDTH,
  }),
  tiny: css({
    margin: '0 auto',
    maxWidth: TINY_WIDTH,
  }),
  // explicit no breakout
  normal: css({}),
  breakout: css({
    [breakoutUp]: {
      '[data-can-breakout=true] &': {
        marginLeft: -BREAKOUT,
        marginRight: -BREAKOUT,
        width: `calc(100% + ${BREAKOUT * 2}px)`,
      },
    },
  }),
  breakoutLeft: css({
    [breakoutUp]: {
      '[data-can-breakout=true] &': {
        marginLeft: -BREAKOUT,
        width: `calc(100% + ${BREAKOUT}px)`,
      },
    },
  }),
  float: css({
    [breakoutUp]: {
      ...floatStyle,
    },
  }),
  floatSmall: css({
    [breakoutUp]: {
      ...floatStyle,
      maxWidth: SMALL_WIDTH,
    },
  }),
  floatTiny: css({
    [breakoutUp]: {
      ...floatStyle,
      maxWidth: TINY_WIDTH,
    },
  }),
}

export const PADDED_MAX_WIDTH = MAX_WIDTH + PADDING * 2
export const PADDED_MAX_WIDTH_BREAKOUT = BREAKOUT_SIZES.breakout + PADDING * 2

const centerStyles = {
  base: css({
    margin: '0 auto',
    padding: PADDING,
    '&:after': {
      content: '""',
      display: 'table',
      clear: 'both',
    },
  }),
  regular: css({
    maxWidth: PADDED_MAX_WIDTH,
  }),
  breakout: css({
    maxWidth: PADDED_MAX_WIDTH_BREAKOUT,
  }),
}

const Center = ({ children, attributes = {}, breakout, ...props }) => (
  <div
    {...centerStyles.base}
    {...centerStyles[breakout ? 'breakout' : 'regular']}
    {...attributes}
    {...props}
    data-can-breakout={!breakout}
    className='center'
  >
    {children}
  </div>
)

export const Breakout = ({ size, children, attributes = {}, ...props }) => (
  <div {...attributes} {...props} {...breakoutStyles[size]}>
    {children}
  </div>
)

Breakout.propTypes = {
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  attributes: PropTypes.object,
}

export default Center
