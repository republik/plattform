import React from 'react'
import { css } from 'glamor'

import colors from '../../../theme/colors'
import { mUp } from '../../../theme/mediaQueries'
import { serifRegular14, serifRegular16 } from '../../Typography/styles'

const styles = {
  blockquote: css({
    backgroundColor: '#f7f7f7',
    margin: '20px auto',
    padding: '15px',
    [mUp]: {
      padding: '25px',
    }
  }),
  paragraph: css({
    margin: '6px 0',
    ...serifRegular14,
    [mUp]: {
      ...serifRegular16,
      margin: '10px 0'
    },
    '&:first-child': {
      marginTop: 0
    },
    '&:last-child': {
      marginBottom: 0
    }
  })
}


export const BlockQuoteParagraph = ({ children }) => (
  <p {...styles.paragraph}>
    {children}
  </p>
)

export const BlockQuoteNested = ({ children }) => (
  <div {...styles.blockquote} style={{borderLeft: `2px solid ${colors.divider}`}}>
    {children}
  </div>
)

export default ({ children }) => (
  <div {...styles.blockquote}>
    {children}
  </div>
)
