import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../../theme/mediaQueries'
import { serifRegular14, serifRegular16 } from '../../Typography/styles'

const styles = {
  blockquote: css({
    margin: '20px auto'
  }),
  paragraph: css({
    backgroundColor: '#f7f7f7',
    margin: 0,
    padding: '0 15px 12px 15px',
    ...serifRegular14,
    [mUp]: {
      ...serifRegular16,
      padding: '0 25px 20px 25px',
      '&:first-child': {
        paddingTop: '20px'
      }
    },
    '&:first-child': {
      paddingTop: '12px'
    }
  })
}

export const BlockQuoteParagraph = ({ children }) => (
  <p {...styles.paragraph}>
    {children}
  </p>
)

export default ({ children }) => (
  <div {...styles.blockquote}>
    {children}
  </div>
)
