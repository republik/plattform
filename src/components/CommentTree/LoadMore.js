import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {sansSerifRegular14} from '../Typography/styles'
import {profilePictureSize, profilePictureMargin} from '../Comment/CommentHeader'
import {DepthBars} from './DepthBar'

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'flex-start',
    height: 30,
  }),
  line: css({
    flex: 1
  }),
  button: css({
    outline: 'none',
    display: 'inline-block',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '4px 0 4px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    ...sansSerifRegular14,
    color: colors.primary,
    lineHeight: 1,
  }),
  connected: css({
    display: 'inline-block',
    width: profilePictureSize / 2,
    marginTop: 18,
    marginRight: 8,
    borderTop: `2px solid ${colors.primary}`,
    marginBottom: 3
  })
}

const marginLeft = (connected) =>
  (connected ? profilePictureMargin + (profilePictureSize / 2) : 0)

const LoadMore = ({t, visualDepth, connected, count, onClick}) => (
  <div {...styles.root}>
    <DepthBars count={visualDepth} tail={connected} />
    <div {...styles.line} style={{marginLeft: -marginLeft(connected)}}>
      {connected && <span {...styles.connected} />}
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
