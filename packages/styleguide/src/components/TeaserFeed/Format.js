import React from 'react'
import { sansSerifMedium14, sansSerifMedium16 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  main: css({
    ...convertStyleToRem(sansSerifMedium14),
    margin: '0 0 6px 0',
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16),
      margin: '-5px 0 8px 0',
    },
  }),
}

/**
 * @typedef {object} FormatProps
 * @property {React.ReactNode} children
 * @property {string} [color]
 */

/**
 * Format component
 * @param {FormatProps} props
 * @returns {JSX.Element}
 */
export const Format = ({ children, color }) => {
  const [colorScheme] = useColorContext()

  return (
    <p
      {...styles.main}
      {...colorScheme.set('color', color || 'text', 'format')}
    >
      {children}
    </p>
  )
}

export default Format
