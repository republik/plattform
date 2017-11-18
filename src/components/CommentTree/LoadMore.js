import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {sansSerifRegular14} from '../Typography/styles'
import {profilePictureSize} from '../Comment/CommentHeader'
import {DepthBars} from './DepthBar'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'flex-start',
    height: 30,
  }),
  line: css({
    flex: 1,
    position: 'relative',
    height: 0,
    borderTop: `2px solid ${colors.primary}`,
    marginTop: '-2px',
  }),
  button: css({
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translateY(-60%)',
    display: 'block',
    WebkitAppearance: 'none',
    background: 'white',
    border: 'none',
    padding: '4px 0 4px 8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',

    ...sansSerifRegular14,
    color: colors.primary,
    lineHeight: 1,
  })
}

const marginLeft = (connected) =>
  (connected ? (profilePictureSize / 2) : 0)

const LoadMore = ({t, visualDepth, connected, count, onClick}) => (
  <div {...styles.root}>
    <DepthBars count={visualDepth - 1} />
    <div {...styles.line} style={{marginLeft: marginLeft(connected)}}>
      <button {...styles.button} onClick={onClick}>
        {t.pluralize('styleguide/CommentTreeLoadMore/label', {count})}
      </button>
    </div>
  </div>
)

LoadMore.propTypes = {
  t: PropTypes.func.isRequired,
  visualDepth: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
}

export default LoadMore
