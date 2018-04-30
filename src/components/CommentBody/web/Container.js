import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../../theme/mediaQueries'
import { serifRegular14, serifRegular16 } from '../../Typography/styles'

const styles = {
  container: css({
    ...serifRegular14,
    [mUp]: {
      ...serifRegular16
    }
  })
}

export default ({ children }) => (
  <div {...styles.container}>
    {children}
  </div>
)
