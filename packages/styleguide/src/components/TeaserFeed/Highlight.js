import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import {
  sansSerifMedium14,
  sansSerifMedium16,
  sansSerifRegular16,
  sansSerifRegular18,
} from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  main: css({
    ...convertStyleToRem(sansSerifRegular16),
    margin: '10px 0 5px 0',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18),
    },
  }),
  label: css({
    ...convertStyleToRem(sansSerifMedium14),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16),
    },
  }),
}

/**
 * @typedef {object} HighlightProps
 * @property {React.ReactNode} children
 */

/**
 * Highlight component
 * @param {HighlightProps} props
 * @returns {JSX.Element}
 */
const Highlight = ({ children, label }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...styles.main} {...colorScheme.set('color', 'text')}>
      {!!label && (
        <span {...styles.label} {...colorScheme.set('color', 'textSoft')}>
          {label}:
        </span>
      )}{' '}
      {children}
    </p>
  )
}

export default Highlight
