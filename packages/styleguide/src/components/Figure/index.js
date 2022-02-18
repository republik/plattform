import React from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'

import { AudioIcon } from '../Icons'

import { mUp } from '../../theme/mediaQueries'
import {
  breakoutStyles,
  PADDED_MAX_WIDTH,
  MAX_WIDTH,
  PADDING,
  BREAKOUT_SIZES,
} from '../Center'

import { plainButtonRule } from '../Button'

export { default as FigureImage, MIN_GALLERY_IMG_WIDTH } from './Image'
export { default as FigureCaption } from './Caption'
export { default as FigureByline } from './Byline'

const styles = {
  figure: css({
    margin: 0,
    marginBottom: 15,
    padding: 0,
    width: '100%',
  }),
  figureGroup: css({
    margin: 0,
    display: 'block',
    position: 'relative',
    '& noscript': {
      display: 'block',
      width: '100%',
    },
    [mUp]: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
  }),
  cover: css({
    position: 'relative',
  }),
  coverSize: css({
    marginTop: 30,
    marginBottom: 20,
  }),
  coverBreakout: css({
    margin: '30px auto 20px auto',
    maxWidth: PADDED_MAX_WIDTH,
    padding: PADDING,
  }),
  coverText: css({
    position: 'absolute',
    left: '5%',
    right: '5%',
    textAlign: 'center',
    display: 'none',
    [mUp]: {
      display: 'block',
    },
  }),
  coverTextTitleBlockHeadline: css({
    display: 'block',
    [mUp]: {
      display: 'none',
    },
  }),
  coverAudio: css(plainButtonRule, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: '50%',
    marginLeft: -45,
    marginTop: -45,
    width: 90,
    height: 90,
    '& svg': {
      position: 'absolute',
      top: '25%',
      left: '25%',
      width: '50%',
      height: '50%',
    },
    [mUp]: {
      marginLeft: -75,
      marginTop: -75,
      width: 150,
      height: 150,
    },
    '@media (hover)': {
      ':hover': {
        animationIterationCount: 'infinite',
      },
    },
  }),
  col2: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 2}% - 8px)`,
      },
    },
  }),
  col3: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 3}% - 10px)`,
      },
    },
  }),
  col4: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 4}% - 12px)`,
      },
    },
  }),
}

const figureBreakout = {
  ...breakoutStyles,
  center: css({
    maxWidth: PADDED_MAX_WIDTH,
    padding: PADDING,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 0,
  }),
}

export const FIGURE_SIZES = {
  ...BREAKOUT_SIZES,
  center: MAX_WIDTH,
}

export const Figure = ({ children, attributes, size }) => (
  <figure {...attributes} {...merge(styles.figure, figureBreakout[size])}>
    {children}
  </figure>
)

Figure.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(Object.keys(figureBreakout)),
  attributes: PropTypes.object,
}

const textPosStyle = ({ anchor, offset }) => {
  if (anchor === 'middle') {
    return {
      position: 'absolute',
      top: '50%',
      transform: 'translate(-, -50%)',
      marginTop: offset,
    }
  }
  if (anchor === 'top') {
    return {
      position: 'absolute',
      top: offset,
    }
  }
  if (anchor === 'bottom') {
    return {
      position: 'absolute',
      bottom: offset,
    }
  }
}

export const CoverTextTitleBlockHeadline = ({ children, attributes }) => (
  <div {...attributes} {...styles.coverTextTitleBlockHeadline}>
    {children}
  </div>
)

const AudioButton = ({ color, backgroundColor, onClick, meta }) => {
  const pulse = css.keyframes({
    '0%': { boxShadow: `0 0 0 0 ${backgroundColor}` },
    '70%': { boxShadow: `0 0 0 10px transparent` },
    '100%': { boxShadow: `0 0 0 0 transparent` },
  })

  return (
    <button
      {...styles.coverAudio}
      onClick={() => {
        onClick(meta)
      }}
      style={{
        color,
        backgroundColor,
      }}
      {...css({
        animation: `${pulse} 2s 3`,
      })}
    >
      <AudioIcon />
    </button>
  )
}

export const FigureCover = ({ size, text, audio, ...props }) => {
  const sizeStyle = size
    ? size === 'breakout'
      ? styles.coverBreakout
      : styles.coverSize
    : undefined
  return (
    <div {...styles.cover} {...sizeStyle}>
      <Figure size={size} {...props} />
      {text && (
        <div style={textPosStyle(text)} {...styles.coverText}>
          {text.element}
        </div>
      )}
      {audio && <AudioButton {...audio} />}
    </div>
  )
}

export const FigureGroup = ({ children, attributes, columns, size, data }) => {
  return (
    <figure
      role='group'
      {...attributes}
      {...merge(styles.figureGroup, breakoutStyles[size])}
      {...styles[`col${columns}`]}
    >
      {children}
    </figure>
  )
}

FigureGroup.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  columns: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
}

FigureGroup.defaultProps = {
  columns: 2,
}
