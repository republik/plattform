import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular10, sansSerifRegular12 } from '../Typography/styles'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { mUp as mUpFront } from '../TeaserFront/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  byline: css({
    ...convertStyleToRem(sansSerifRegular10),
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular12)
    }
  })
}

const positionBaseStyle = {
  ...convertStyleToRem(sansSerifRegular12),
  transform: 'rotate(-90deg)',
  transformOrigin: '0 100%',
  textAlign: 'left',
  position: 'absolute',
  bottom: 0,
  whiteSpace: 'nowrap'
}

const positionStyle = {
  belowRight: css({
    position: 'absolute',
    whiteSpace: 'nowrap',
    bottom: -15,
    right: 0,
    display: 'block',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular10)
    }
  }),
  below: css({
    display: 'block',
    marginTop: '5px',
    paddingLeft: '15px',
    [mUpFront]: {
      ...convertStyleToRem(sansSerifRegular12),
      paddingLeft: 0
    }
  }),
  belowFeuilleton: css({
    display: 'block',
    marginTop: '5px',
    paddingLeft: 0,
    [mUpFront]: {
      ...convertStyleToRem(sansSerifRegular12)
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
    ...convertStyleToRem(sansSerifRegular10),
    left: '100%',
    marginLeft: '14px',
    [mUpFront]: {
      ...convertStyleToRem(sansSerifRegular10)
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
  }),
  // left inside relative container on desktop and mobile.
  leftInsideOnlyImage: css({
    ...positionBaseStyle,
    ...convertStyleToRem(sansSerifRegular10),
    left: 0,
    marginTop: 0,
    marginLeft: '15px',
    paddingLeft: '15px',
    [mUpFront]: {
      ...convertStyleToRem(sansSerifRegular12),
      marginLeft: '18px'
    }
  })
}

export const Byline = ({ children, attributes, style, position }) => {
  return (
    <span
      {...attributes}
      style={style}
      {...merge(styles.byline, position && positionStyle[position])}
    >
      {children}
    </span>
  )
}

Byline.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  position: PropTypes.oneOf([
    'belowRight',
    'below',
    'belowFeuilleton',
    'right',
    'rightCompact',
    'left',
    'leftInside',
    'leftInsideOnlyImage'
  ])
}

Byline.defaultProps = {
  style: {}
}

export default Byline
