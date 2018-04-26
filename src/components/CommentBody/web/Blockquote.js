import React from 'react'

import { BlockQuote, BlockQuoteParagraph } from '../../BlockQuote'

export default ({ children }) => (
  <BlockQuote style={{margin: '20px auto'}}>
    <BlockQuoteParagraph style={{
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit'
    }}>
      {children}
    </BlockQuoteParagraph>
  </BlockQuote>
)
