import React from 'react'
import { css } from 'glamor'
import colors from '../../../../theme/colors'
import { sansSerifRegular16 } from '../../../Typography/styles'
import { convertStyleToRem } from '../../../Typography/utils'

const styles = {
  root: css({
    ...convertStyleToRem(sansSerifRegular16),
    color: colors.error,
    marginTop: 12
  })
}

export const Error = ({ children }) => <div {...styles.root}>{children}</div>
