import React from 'react'

import { paragraphStyle } from './Paragraph'

export const BlockQuoteParagraph = ({ children }) => (
 <p style={{
    ...paragraphStyle,
    margin: 0,
    padding: '0 0 20px 0',
  }}>
    {children}
  </p>
)

export default ({ children }) => (
  <div style={{
    backgroundColor: '#f7f7f7',
    margin: '20px auto',
    padding: '20px 25px 0 25px',
  }}>
    {children}
  </div>
)

