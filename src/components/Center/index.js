import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'

const MAX_WIDTH = 665
const PADDING = 20
const DEFAULT_MARGIN = 15
const BREAKOUT = 155 + DEFAULT_MARGIN
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

const breakoutUp = `@media only screen and (min-width: ${MAX_WIDTH +
  BREAKOUT * 2 +
  PADDING * 2}px)`

const styles = {
  center: css({
    maxWidth: MAX_WIDTH,
    margin: '0 auto',
    padding: PADDING
  }),
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
      marginRight: -BREAKOUT
    }
  }),
  breakoutLeft: css({
    [breakoutUp]: {
      marginLeft: -BREAKOUT
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

export const Center = ({ children, attributes = {}, ...props }) => (
  <div {...styles.center} {...attributes} {...props}>
    {children}
  </div>
)

export const Breakout = ({ size, children, attributes = {}, ...props }) => (
  <div {...styles[size]} {...attributes} {...props}>
    {children}
  </div>
)

Breakout.propTypes = {
  size: PropTypes.oneOf([
    'regular',
    'narrow',
    'tiny',
    'breakout',
    'breakoutLeft',
    'float',
    'floatSmall',
    'floatTiny'
  ]).isRequired,
  attributes: PropTypes.object
}

Breakout.defaultProps = {
  size: 'regular'
}
