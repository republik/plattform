import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {sansSerifRegular14} from '../Typography/styles'

const styles = {
  root: css({
    position: 'relative',
    height: 0,
    borderTop: `2px solid ${colors.primary}`,
    marginTop: '-2px'
  }),
  button: css({
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translateY(-60%)',
    display: 'block',
    '-webkit-appearance': 'none',
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

const LoadMore = ({t, visualDepth, count, onClick}) => (
  <div {...styles.root} style={{marginLeft: (visualDepth - 1) * 15}}>
    <button {...styles.button} onClick={onClick}>
      {t.pluralize('styleguide/CommentTreeLoadMore/label', {count})}
    </button>
  </div>
)

LoadMore.propTypes = {
  t: PropTypes.func.isRequired,
  visualDepth: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
}

export default LoadMore
