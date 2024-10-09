import React from 'react'
import { Editorial } from '../Typography'

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
  return (
    <Editorial.Credit style={{ color: 'inherit' }}>{children}</Editorial.Credit>
  )
}

export default Credit
