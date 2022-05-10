import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Breakout, MAX_WIDTH_MOBILE } from '../Center'
import { Collapsable } from '../Collapsable'
import { mUp, onlyS } from '../../theme/mediaQueries'

export const IMAGE_SIZES = {
  XXS: 80,
  XS: 120,
  S: 155,
  M: 240,
  L: 325,
}
export const DEFAULT_IMAGE_SIZE = 'S'

const textAttribute = 'data-infobox-text'
export const textAttributes = { [textAttribute]: true }

const figureChildStyles = Object.keys(IMAGE_SIZES).reduce(
  (styles, key) => {
    const size = IMAGE_SIZES[key]
    styles[key] = css({
      '& figure': {
        width: size,
        maxWidth: '100%',
      },
      [mUp]: {
        minHeight: size,
      },
    })
    return styles
  },
  {
    absolute: css({
      [onlyS]: {
        '& figure': {
          maxWidth: MAX_WIDTH_MOBILE,
        },
      },
      [mUp]: {
        position: 'relative',
        '& figure': {
          position: 'absolute',
          left: 0,
          margin: '0 15px 15px 0',
          top: 0,
        },
      },
    }),
    float: css({
      '& figure': {
        float: 'left',
        margin: '10px 15px 5px 0',
        width: '99px',
      },
      // Micro clearfix hack to avoid surrounding text floating into info boxes
      // with image and very short text.
      '&::before': {
        content: ' ',
        display: 'table',
      },
      '&::after': {
        content: ' ',
        display: 'table',
        clear: 'both',
      },
    }),
  },
)
const textChildStyles = Object.keys(IMAGE_SIZES).reduce((styles, key) => {
  const size = IMAGE_SIZES[key]
  styles[key] = css({
    [mUp]: {
      [`& [${textAttribute}]`]: {
        marginLeft: size + 20,
        // Text in ListItem
        [`& [${textAttribute}]`]: {
          marginLeft: 0,
        },
      },
    },
  })
  return styles
}, {})

const floatMarginStyle = css({
  [onlyS]: {
    margin: '40px auto',
  },
})

const defaultMarginStyle = css({
  margin: '40px 0',
  [mUp]: {
    margin: '60px 0',
  },
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

const InfoBox = ({
  t,
  children,
  attributes,
  size,
  margin = true,
  figureSize,
  figureFloat,
  collapsable,
  editorPreview,
}) => {
  let styles = {}
  const float = figureFloat || size === 'float'
  if (figureSize) {
    const allowedFigureSize = size === 'float' ? 'XS' : figureSize
    styles = {
      ...(float ? figureChildStyles.float : figureChildStyles.absolute),
      ...figureChildStyles[allowedFigureSize],
    }
    if (!float) {
      styles = {
        ...styles,
        ...textChildStyles[allowedFigureSize],
      }
    }
  }

  styles = {
    ...styles,
    ...(size === 'float'
      ? floatMarginStyle
      : margin
      ? defaultMarginStyle
      : undefined),
  }

  const content = collapsable ? (
    <Collapsable
      t={t}
      height={{ mobile: 121, desktop: 151 }}
      editorPreview={editorPreview}
    >
      {children}
    </Collapsable>
  ) : (
    children
  )

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, figureSize)}>
      <section {...styles}>{content}</section>
    </Breakout>
  )
}

InfoBox.propTypes = {
  t: PropTypes.func,
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['float', 'breakout']),
  figureSize: PropTypes.oneOf(Object.keys(IMAGE_SIZES)),
  figureFloat: PropTypes.bool.isRequired,
  collapsable: PropTypes.bool,
}

InfoBox.defaultProps = {
  figureFloat: false,
  collapsable: false,
}

export default InfoBox
