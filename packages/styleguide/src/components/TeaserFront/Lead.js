import React from 'react'
import colors from '../../theme/colors'
import { css } from 'glamor'
import { mUp } from './mediaQueries'
import {
  serifRegular18,
  serifRegular19,
  serifRegular23,
} from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'

const leadStyle = {
  ...convertStyleToRem(serifRegular19),
  lineHeight: pxToRem('27px'),
  margin: '0 0 10px 0',
  color: colors.text,
}

const lead = css({
  ...leadStyle,
  [mUp]: {
    ...convertStyleToRem(serifRegular23),
    margin: '0 0 20px 0',
  },
})

const leadSmall = css({
  ...leadStyle,
  [mUp]: {
    ...convertStyleToRem(serifRegular18),
    margin: '0 0 20px 0',
  },
})

/**
 * @typedef {object} LeadProps
 * @property {React.ReactNode} children
 * @property {number} [columns]
 */

/**
 * Lead component
 * @param {LeadProps} props
 * @returns {JSX.Element}
 */
const Lead = ({ children, columns, attributes }) => (
  <span
    {...attributes}
    {...(columns === 3 ? leadSmall : lead)}
    style={{ color: 'inherit' }}
  >
    {children}
  </span>
)

export default Lead
