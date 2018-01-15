import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {sansSerifRegular14} from '../Typography/styles'
import {profilePictureSize, profilePictureMargin} from '../Comment/CommentHeader'
import {getWidth} from './DepthBar'

const borderWidth = 2
const styles = {
  root: css({
    position: 'relative',
    height: 0,
    borderTop: `${borderWidth}px solid ${colors.primary}`,
    marginTop: '-2px'
  }),
  button: css({
    position: 'absolute',
    top: -14,
    outline: 'none',
    display: 'block',
    WebkitAppearance: 'none',
    background: 'white',
    border: 'none',
    padding: '4px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',

    ...sansSerifRegular14,
    color: colors.primary,
    lineHeight: 1,
  })
}

const Collapse = ({t, visualDepth, onClick}) => {
  const depthWidth = getWidth(visualDepth)
  const lineWidth = depthWidth - profilePictureSize / 2 - profilePictureMargin + borderWidth / 2
  return (
    <div {...styles.root} style={{width: lineWidth}}>
      <button {...styles.button} style={{left: depthWidth}} onClick={onClick}>
        {t('styleguide/CommentTreeCollapse/label')}
      </button>
    </div>
  )
}

Collapse.propTypes = {
  t: PropTypes.func.isRequired,
  visualDepth: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
}

export default Collapse
