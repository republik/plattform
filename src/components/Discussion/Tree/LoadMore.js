import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import colors from '../../../theme/colors'
import { sansSerifRegular14 } from '../../Typography/styles'

const styles = {
  root: css({
    ...sansSerifRegular14,
    color: colors.primary,
    outline: 'none',
    display: 'block',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: '40px',
    padding: 0,
    '&:hover': {
      color: colors.secondary
    }
  })
}

export const LoadMore = ({ t, count, onClick }) => (
  <button {...styles.root} onClick={onClick}>
    {t.pluralize('styleguide/CommentTreeLoadMore/label', { count })}
  </button>
)

LoadMore.propTypes = {
  t: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
}
