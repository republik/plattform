import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { dUp } from './mediaQueries'
import colors from '../../theme/colors'

const TEXT_PADDING = 50

const positionDefault = {
  height: `calc(50% - ${TEXT_PADDING}px)`,
  width: `calc(50% - ${TEXT_PADDING}px)`
}

const styles = {
  rootPosition: css({
    [dUp]: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '100%'
    }
  }),
  positioned: css({
    position: 'relative'
  }),
  topleft: css({
    [dUp]: {
      ...positionDefault,
      left: `${TEXT_PADDING}px`,
      top: `${TEXT_PADDING}px`
    }
  }),
  topright: css({
    [dUp]: {
      ...positionDefault,
      left: '50%',
      top: `${TEXT_PADDING}px`
    }
  }),
  bottomleft: css({
    [dUp]: {
      ...positionDefault,
      left: `${TEXT_PADDING}px`,
      top: '50%'
    }
  }),
  bottomright: css({
    [dUp]: {
      ...positionDefault,
      left: '50%',
      top: '50%'
    }
  })
}

const Text = ({
  children,
  attributes,
  position,
  center,
  color,
  maxWidth
}) => {
  const textAlign = center ? 'center' : ''
  const rootStyles = position ? styles.rootPosition : {}
  return (
    <div {...rootStyles}>
      <div
        {...attributes}
        {...css(styles.positioned, position ? styles[position] : {})}
        style={{ color, textAlign, maxWidth }}
      >
        {children}
      </div>
    </div>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  position: PropTypes.oneOf([
    'topleft',
    'topright',
    'bottomleft',
    'bottomright'
  ]),
  textColor: PropTypes.string,
  maxWidth: PropTypes.string
}

Text.defaultProps = {
  color: colors.text,
  maxWidth: ''
}

export default Text
