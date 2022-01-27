import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../../theme/mediaQueries'
import { serifRegular14, serifRegular16 } from '../../Typography/styles'
import { Editorial } from '../../Typography'
import { convertStyleToRem } from '../../Typography/utils'

const styles = {
  container: css({
    wordWrap: 'break-word',
    ...convertStyleToRem(serifRegular14),
    [mUp]: {
      ...convertStyleToRem(serifRegular16)
    },
    '& > *:first-child': {
      marginTop: 0
    },
    '& > *:last-child': {
      marginBottom: 0
    }
  })
}

export default ({ children }) => (
  <div {...styles.container} {...Editorial.fontRule}>
    {children}
  </div>
)
