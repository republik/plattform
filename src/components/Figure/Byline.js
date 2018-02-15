import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular10, sansSerifRegular12 } from '../Typography/styles'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { mUp as mUpFront } from '../TeaserFront/mediaQueries'

const styles = {
  byline: css({
    ...sansSerifRegular10,
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    [mUp]: {
      ...sansSerifRegular12
    }
  })
}

const positionBaseStyle = {
  ...sansSerifRegular12,
  transform: 'rotate(-90deg)',
  transformOrigin: '0 100%',
  textAlign: 'left',
  position: 'absolute',
  bottom: 0,
  whiteSpace: 'nowrap'
}

const positionStyle = {
  below: css({
    display: 'block',
    marginTop: '5px',
    paddingLeft: '15px',
    [mUpFront]: {
      ...sansSerifRegular12,
      paddingLeft: 0
    }
  }),
  // right of relative container on desktop, below on mobile.
  right: css({
    paddingLeft: '15px',
    [mUpFront]: {
      ...positionBaseStyle,
      left: '100%',
      marginLeft: '18px'
    }
  }),
  // right of relative container on desktop and mobile, always small font size.
  rightCompact: css({
    ...positionBaseStyle,
    ...sansSerifRegular10,
    left: '100%',
    marginLeft: '15px',
    [mUpFront]: {
      ...sansSerifRegular10
    }
  }),
  // left of relative container on desktop, below on mobile.
  left: css({
    paddingLeft: '15px',
    [mUpFront]: {
      ...positionBaseStyle,
      left: 0,
      marginLeft: '-5px'
    }
  }),
  // left inside relative container on desktop, below on mobile.
  leftInside: css({
    display: 'block',
    marginTop: '5px',
    paddingLeft: '15px',
    [mUpFront]: {
      ...positionBaseStyle,
      left: 0,
      marginTop: 0,
      marginLeft: '18px'
    }
  })
}

export const Byline = ({ children, attributes, style, position }) => {
  return (
    <span
      {...attributes}
      style={style}
      {...merge(styles.byline, positionStyle[position])}
    >
      {children}
    </span>
  )
}

Byline.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  position: PropTypes.oneOf([
    'below',
    'right',
    'rightCompact',
    'left',
    'leftInside'
  ])
}

Byline.defaultProps = {
  style: {}
}

export default Byline
