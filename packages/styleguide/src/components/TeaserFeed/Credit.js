import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  main: css({
    margin: 0,
    ...convertStyleToRem(sansSerifRegular14),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
    },
  }),
}

/**
 * @typedef {object} CreditProps
 * @property {React.ReactNode} children
 */

/**
 * Credit component
 * @param {CreditProps} props
 * @returns {JSX.Element}
 */
const Credit = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...styles.main} {...colorScheme.set('color', 'text')}>
      {children}
    </p>
  )
}

export default Credit
