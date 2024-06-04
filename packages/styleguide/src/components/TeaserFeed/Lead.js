import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { serifRegular17, serifRegular19 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  main: css({
    ...convertStyleToRem(serifRegular17),
    margin: '0 0 5px 0',
    [mUp]: {
      ...convertStyleToRem(serifRegular19),
    },
  }),
}

/**
 * @typedef LeadProps
 * @property {React.ReactNode} children
 */

/**
 * Lead component
 * @param {LeadProps} props
 * @returns {JSX.Element}
 */
const Lead = ({ children }) => {
  return <p {...styles.main}>{children}</p>
}

export default Lead
