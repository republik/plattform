import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Breakout } from '../Center'
import { mUp } from '../../theme/mediaQueries'

export const IMAGE_SIZE = {
  XS: 120,
  S: 155,
  M: 240,
  L: 325
}

export const textAttributes = {'data-infobox-text': true}
const textSelector = '[data-infobox-text]'

const figureChildStyles = Object.keys(IMAGE_SIZE).reduce((styles, key) => {
  const size = IMAGE_SIZE[key]
  styles[key] = css({
    [mUp]: {
      '& figure': {
        width: size
      }
    }
  })
  return styles
}, {
  absolute: css({
    [mUp]: {
      position: 'relative',
      '& figure': {
        position: 'absolute',
        left: 0,
        margin: '0 15px 15px 0',
        top: 0
      }
    }
  }),
  float: css({
    '& figure': {
      float: 'left',
      margin: '10px 15px 5px 0',
      width: '99px'
    }
  })
})
const textChildStyles = Object.keys(IMAGE_SIZE).reduce((styles, key) => {
  const size = IMAGE_SIZE[key]
  styles[key] = css({
    [mUp]: {
      [`& ${textSelector}`]: {
        marginLeft: size + 20
      }
    }
  })
  return styles
}, {})

const getBreakoutSize = (size, hasFigure) => {
  if (size === 'float') {
    return hasFigure ? 'floatSmall' : 'floatTiny'
  }
  if (size === 'breakout') {
    return 'breakoutLeft'
  }
  return size
}

const InfoBox = ({ children, attributes, size, figureSize, figureFloat }) => {
  let styles = {}
  if (figureSize) {
    const allowedFigureSize = size === 'float' ? 'XS' : figureSize
    const float = figureFloat || size === 'float'
    styles = {
      ...(float ? figureChildStyles.float : figureChildStyles.absolute),
      ...figureChildStyles[allowedFigureSize]
    }
    if (!float) {
      styles = {
        ...styles,
        ...textChildStyles[allowedFigureSize]
      }
    }
  }

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, figureSize)}>
      <section {...styles}>
        {children}
      </section>
    </Breakout>
  )
}

InfoBox.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['regular', 'float', 'breakout']).isRequired,
  figureSize: PropTypes.oneOf(Object.keys(IMAGE_SIZE)),
  figureFloat: PropTypes.bool.isRequired
}

InfoBox.defaultProps = {
  size: 'regular',
  figureFloat: false
}

export default InfoBox
