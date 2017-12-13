import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'


export const PADDING = 20

export const MAX_WIDTH = 625
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
  marginLeft: -BREAKOUT,
  width: '100%'
}

const breakoutUp = `@media only screen and (min-width: ${
  MAX_WIDTH +
  BREAKOUT * 2 +
  PADDING * 2 + 
  PADDING}px)`

const styles = {
  center: css({
    maxWidth: MAX_WIDTH + PADDING * 2,
    margin: '0 auto',
    padding: PADDING
  }),
  clear: css({
    clear: 'both'
  })
}

export const BREAKOUT_SIZES = {
  narrow: NARROW_WIDTH,
  tiny: TINY_WIDTH,
  breakout: MAX_WIDTH + BREAKOUT * 2,
  breakoutLeft: MAX_WIDTH + BREAKOUT,
  float: NARROW_WIDTH,
  floatSmall: SMALL_WIDTH,
  floatTiny: TINY_WIDTH
}

export const breakoutStyles = {
  narrow: css({
    [breakoutUp]: {
      margin: '0 auto',
      maxWidth: NARROW_WIDTH
    }
  }),
  tiny: css({
    [breakoutUp]: {
      margin: '0 auto',
      maxWidth: TINY_WIDTH
    }
  }),
  breakout: css({
    [breakoutUp]: {
      marginLeft: -BREAKOUT,
      marginRight: -BREAKOUT,
      width: `calc(100% + ${BREAKOUT * 2}px)`
    }
  }),
  breakoutLeft: css({
    [breakoutUp]: {
      marginLeft: -BREAKOUT,
      width: `calc(100% + ${BREAKOUT}px)`
    }
  }),
  float: css({
    [breakoutUp]: {
      ...floatStyle
    }
  }),
  floatSmall: css({
    [breakoutUp]: {
      ...floatStyle,
      maxWidth: SMALL_WIDTH
    }
  }),
  floatTiny: css({
    [breakoutUp]: {
      ...floatStyle,
      maxWidth: TINY_WIDTH
    }
  })
}

const Center = ({ children, attributes = {}, ...props }) => (
  <div {...styles.center} {...attributes} {...props}>
    {children}
    <div {...styles.clear} />
  </div>
)

export const Breakout = ({ size, children, attributes = {}, ...props }) => (
  <div {...attributes} {...props} {...breakoutStyles[size]}>
    {children}
  </div>
)

Breakout.propTypes = {
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  attributes: PropTypes.object
}

export default Center
