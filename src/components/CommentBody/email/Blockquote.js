import React from 'react'

import { fontFamilies } from '../../../theme/fonts'

import { BlockQuote, BlockQuoteParagraph } from '../../BlockQuote'
import { paragraphStyle } from './Paragraph'

export default ({ children }) => (
  <p style={{
    ...paragraphStyle,
    backgroundColor: '#f7f7f7',
    margin: '20px auto',
    padding: '12px 15px',
  }}>
    {children}
  </p>
)
