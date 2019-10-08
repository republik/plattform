import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import colors from '../../../theme/colors'
import { sansSerifRegular14 } from '../../Typography/styles'
import { usePrevious } from '../../../lib/usePrevious'
import { convertStyleToRem, pxToRem } from '../../Typography/utils'

const styles = {
  root: css({
    ...convertStyleToRem(sansSerifRegular14),
    color: colors.primary,
    position: 'relative',
    outline: 'none',
    display: 'block',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: pxToRem('40px'),
    padding: 0,
    '@media (hover)': {
      ':hover': {
        color: colors.secondary
      }
    }
  }),
  alternative: css({
    color: 'white',
    padding: '0 7px',
    '::before': {
      position: 'absolute',
      content: '""',
      display: 'block',
      top: 10,
      left: 0,
      right: 0,
      bottom: 9,
      borderRadius: 10,
      background: colors.primary
    },
    '@media (hover)': {
      ':hover': {
        color: 'white'
      },
      ':hover::before': {
        background: colors.secondary
      },
    },
    '& > span': {
      position: 'relative'
    }
  })
}

export const LoadMore = React.memo(({ t, count, onClick }) => {
  const previousCount = usePrevious(count)
  if (count === 0) {
    return null
  } else {
    return (
      <LoadMore1
        t={t}
        alternative={previousCount !== undefined && count !== previousCount}
        count={count}
        onClick={onClick}
      />
    )
  }
})

LoadMore.propTypes = {
  t: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
}

/**
 * This component is exported only so that we can document it in the styleguide.
 */
export const LoadMore1 = ({ t, alternative, count, onClick }) => (
  <button {...styles.root} {...alternative && styles.alternative} onClick={onClick}>
    <span>{t.pluralize('styleguide/CommentTreeLoadMore/label', { count })}</span>
  </button>
)
