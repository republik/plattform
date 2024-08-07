import React from 'react'

import colors from '../../../theme/colors'
import { paragraphStyle } from './Paragraph'
import {
  BlockQuoteNestedProps,
  BlockQuoteParagraphProps,
  BlockQuoteProps,
} from '../web/Blockquote'

export const BlockQuoteParagraph = ({ children }: BlockQuoteParagraphProps) => (
  <p
    style={{
      ...paragraphStyle,
      margin: 0,
      padding: '10px 0',
    }}
  >
    {children}
  </p>
)

export const BlockQuoteNested = ({ children }: BlockQuoteNestedProps) => (
  <div
    style={{
      backgroundColor: '#f7f7f7',
      borderLeft: `2px solid ${colors.divider}`,
      margin: '20px auto',
      padding: '20px 25px',
    }}
  >
    {children}
  </div>
)

const BlockQuote = ({ children }: BlockQuoteProps) => (
  <div
    style={{
      backgroundColor: '#f7f7f7',
      margin: '20px auto',
      padding: '20px 25px',
    }}
  >
    {children}
  </div>
)

export default BlockQuote
