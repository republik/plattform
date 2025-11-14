import { css } from 'glamor'
import React from 'react'

import { mUp } from '../../theme/mediaQueries'
import { Interaction } from '../Typography'
import { sansSerifRegular15, sansSerifRegular16 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  container: css({
    wordWrap: 'break-word',
    ...convertStyleToRem(sansSerifRegular15),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular16),
    },
    '& > *:first-child': {
      marginTop: 0,
    },
    '& > *:last-child': {
      marginBottom: 0,
    },
  }),
}

export default ({ children }) => (
  <div {...styles.container} {...Interaction.fontRule}>
    {children}
  </div>
)
