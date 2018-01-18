import React from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import {
  breakoutStyles,
  MAX_WIDTH,
  PADDING,
  BREAKOUT_SIZES
} from '../Center'

export { default as FigureImage } from './Image'
export { default as FigureCaption } from './Caption'
export { default as FigureByline } from './Byline'

const styles = {
  figure: css({
    margin: 0,
    marginBottom: 15,
    padding: 0,
    width: '100%'
  }),
  figureGroup: css({
    margin: 0,
    display: 'block',
    [mUp]: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    }
  }),
  cover: css({
    position: 'relative'
  }),
  coverSize: css({
    marginTop: 30,
    marginBottom: 20
  }),
  coverText: css({
    position: 'absolute',
    paddingLeft: 50,
    paddingRight: 50,
    textAlign: 'center',
    display: 'none',
    [mUp]: {
      display: 'block'
    }
  }),
  coverTextTitleBlockHeadline: css({
    display: 'block',
    [mUp]: {
      display: 'none'
    }
  }),
  col2: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 2}% - 8px)`
      }
    }
  }),
  col3: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 3}% - 10px)`
      }
    }
  }),
  col4: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 4}% - 12px)`
      }
    }
  })
}

const figureBreakout = {
  ...breakoutStyles,
  center: css({
    maxWidth: MAX_WIDTH + PADDING * 2,
    padding: PADDING,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 0
  })
}

export const FIGURE_SIZES = {
  ...BREAKOUT_SIZES,
  center: MAX_WIDTH
}

export const Figure = ({ children, attributes, size }) => (
  <figure {...attributes} {...merge(styles.figure, figureBreakout[size])}>
    {children}
  </figure>
)

Figure.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(Object.keys(figureBreakout)),
  attributes: PropTypes.object
}

const textPosStyle = ({anchor, offset}) => {
  if (anchor === 'middle') {
    return {
      position: 'absolute',
      top: '50%',
      transform: 'translate(-, -50%)',
      marginTop: offset
    }
  }
  if (anchor === 'top') {
    return {
      position: 'absolute',
      top: offset
    }
  }
  if (anchor === 'bottom') {
    return {
      position: 'absolute',
      bottom: offset
    }
  }
}

export const CoverTextTitleBlockHeadline = ({children, attributes}) =>
  <div {...attributes} {...styles.coverTextTitleBlockHeadline}>{children}</div>

export const FigureCover = ({size, text, ...props}) => {
  return <div {...styles.cover} {...(size ? styles.coverSize : {})}>
    <Figure size={size} {...props} />
    {text && <div style={textPosStyle(text)} {...styles.coverText}>
      {text.element}
    </div>}
  </div>
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
  columns: PropTypes.oneOf([2, 3, 4]).isRequired
}

FigureGroup.defaultProps = {
  columns: 2
}

