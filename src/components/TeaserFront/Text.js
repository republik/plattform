import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { tUp } from './mediaQueries'
import colors from '../../theme/colors'

const TEXT_PADDING = 50

const positionHalfWidth = {
  height: `calc(50% - ${TEXT_PADDING}px)`,
  width: `calc(50% - ${TEXT_PADDING}px)`
}

const positionFullWidth = {
  position: 'absolute',
  left: `${TEXT_PADDING}px`,
  right: `${TEXT_PADDING}px`
}

const styles = {
  rootPosition: css({
    [tUp]: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '100%'
    }
  }),
  rootMiddle: css({
    [tUp]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }),
  positioned: css({
    position: 'relative'
  }),
  topleft: css({
    [tUp]: {
      ...positionHalfWidth,
      left: `${TEXT_PADDING}px`,
      top: `${TEXT_PADDING}px`
    }
  }),
  topright: css({
    [tUp]: {
      ...positionHalfWidth,
      left: '50%',
      top: `${TEXT_PADDING}px`
    }
  }),
  bottomleft: css({
    [tUp]: {
      ...positionHalfWidth,
      left: `${TEXT_PADDING}px`,
      top: '50%'
    }
  }),
  bottomright: css({
    [tUp]: {
      ...positionHalfWidth,
      left: '50%',
      top: '50%'
    }
  }),
  top: css({
    [tUp]: {
      ...positionFullWidth,
      top: `${TEXT_PADDING}px`
    }
  }),
  middle: css({
    [tUp]: {
      ...positionFullWidth
    }
  }),
  bottom: css({
    [tUp]: {
      ...positionFullWidth,
      bottom: `${TEXT_PADDING}px`
    }
  })
}

const Text = ({
  children,
  attributes,
  position,
  center,
  color,
  maxWidth,
  margin
}) => {
  const textAlign = center ? 'center' : ''
  const rootStyles = position ? styles.rootPosition : {}
  const middleStyles = position === 'middle' ? styles.rootMiddle : {}
  return (
    <div {...rootStyles} {...middleStyles}>
      <div
        {...attributes}
        {...css(styles.positioned, position ? styles[position] : {})}
        style={{ color, textAlign, maxWidth, margin }}
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
    'bottomright',
    'top',
    'middle',
    'bottom'
  ]),
  textColor: PropTypes.string,
  maxWidth: PropTypes.string,
  margin: PropTypes.string
}

Text.defaultProps = {
  color: colors.text,
  maxWidth: '',
  margin: ''
}

export default Text
