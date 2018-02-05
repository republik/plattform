import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Breakout, MAX_WIDTH_MOBILE } from '../Center'
import { mUp, onlyS } from '../../theme/mediaQueries'

export const IMAGE_SIZES = {
  XS: 120,
  S: 155,
  M: 240,
  L: 325
}
export const DEFAULT_IMAGE_SIZE = 'S'

export const textAttributes = {'data-infobox-text': true}
const textSelector = '[data-infobox-text]'

const figureChildStyles = Object.keys(IMAGE_SIZES).reduce((styles, key) => {
  const size = IMAGE_SIZES[key]
  styles[key] = css({
    '& figure': {
      width: size,
      maxWidth: '100%'
    }
  })
  return styles
}, {
  absolute: css({
    [onlyS]: {
      '& figure': {
        maxWidth: MAX_WIDTH_MOBILE
      }
    },
    [mUp]: {
      position: 'relative',
      minHeight: IMAGE_SIZES.S,
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
    },
    // Micro clearfix hack to avoid surrounding text floating into info boxes
    // with image and very short text.
    '&::before': {
      content: ' ',
      display: 'table'
    },
    '&::after': {
      content: ' ',
      display: 'table',
      clear: 'both'
    }
  })
})
const textChildStyles = Object.keys(IMAGE_SIZES).reduce((styles, key) => {
  const size = IMAGE_SIZES[key]
  styles[key] = css({
    [mUp]: {
      [`& ${textSelector}`]: {
        marginLeft: size + 20
      }
    }
  })
  return styles
}, {})

const floatStyle = css({
  [onlyS]: {
    margin: '40px auto'
  }
})

const defaultStyle = css({
  margin: '40px 0',
  [mUp]: {
    margin: '60px 0'
  }
})

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
  const float = figureFloat || size === 'float'
  if (figureSize) {
    const allowedFigureSize = size === 'float' ? 'XS' : figureSize
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

  styles = {
    ...styles,
    ...(size === 'float' ? floatStyle : defaultStyle)
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
  size: PropTypes.oneOf(['float', 'breakout']),
  figureSize: PropTypes.oneOf(Object.keys(IMAGE_SIZES)),
  figureFloat: PropTypes.bool.isRequired
}

InfoBox.defaultProps = {
  figureFloat: false
}

export default InfoBox
