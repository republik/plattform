import React from 'react'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {sansSerifRegular14} from '../Typography/styles'

const styles = {
  root: css({
    display: 'block',
    '-webkit-appearance': 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',

    ...sansSerifRegular14,
    color: colors.primary
  })
}

const LoadMore = ({t, count, onClick}) => (
  <button {...styles.root} onClick={onClick}>
    {t('components/CommentTree/LoadMore/label', {count})}
  </button>
)

export default LoadMore
