import React from 'react'

import { BlockQuote, BlockQuoteParagraph } from '../../BlockQuote'
import { fontFamilies } from '../../../theme/fonts'

export default ({ children }) => (
  <BlockQuote style={{margin: '20px auto'}}>
    <BlockQuoteParagraph style={{
      fontFamily: fontFamilies.serifRegular,
      fontSize: 'inherit',
      lineHeight: 'inherit'
    }}>
      {children}
    </BlockQuoteParagraph>
  </BlockQuote>
)
