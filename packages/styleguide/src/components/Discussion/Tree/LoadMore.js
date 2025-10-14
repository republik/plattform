import { css } from 'glamor'
import PropTypes from 'prop-types'
import React, { useMemo, useState } from 'react'
import { usePrevious } from '../../../lib/usePrevious'
import { useColorContext } from '../../Colors/ColorContext'
import BabySpinner from '../../Spinner/BabySpinner'

import { sansSerifRegular14 } from '../../Typography/styles'
import { convertStyleToRem, pxToRem } from '../../Typography/utils'

const styles = {
  root: css({
    ...convertStyleToRem(sansSerifRegular14),
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
  }),
  alternative: css({
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
    },
    '& > span': {
      position: 'relative',
    },
  }),
}

export const LoadMore = React.memo(({ t, count, onClick }) => {
  const previousCount = usePrevious(count)
  if (count > 0) {
    return (
      <LoadMore1
        t={t}
        alternative={previousCount !== undefined && count !== previousCount}
        count={count}
        onClick={onClick}
      />
    )
  }
  return null
})

LoadMore.propTypes = {
  t: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
}

/**
 * This component is exported only so that we can document it in the styleguide.
 */
export const LoadMore1 = ({ t, alternative, count, onClick }) => {
  const [colorScheme] = useColorContext()
  const [showSpinner, setShowSpinner] = useState(false)
  const styleRules = useMemo(() => {
    return {
      root: css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('primaryHover'),
          },
        },
      }),
      alternative: css({
        '::before': { background: colorScheme.getCSSColor('primary') },
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('default'),
          },
          ':hover::before': {
            background: colorScheme.getCSSColor('primaryHover'),
          },
        },
      }),
    }
  }, [colorScheme])
  return (
    <button
      {...styles.root}
      {...colorScheme.set('color', alternative ? 'default' : 'primary')}
      {...(alternative && styles.alternative)}
      {...(alternative ? styleRules.alternative : styleRules.root)}
      onClick={(e) => {
        setShowSpinner(true)
        onClick(e).finally(() => {
          setShowSpinner(false)
        })
      }}
    >
      <span>
        {t('styleguide/CommentTreeLoadMore/label')} ({count})
        {showSpinner && (
          <span
            style={{
              paddingLeft: 6,
            }}
          >
            <BabySpinner />
          </span>
        )}
      </span>
    </button>
  )
}
