import React from 'react'
import { fontFamilies } from '../../../theme/fonts'
import { paragraphStyle } from '../email/Paragraph'

export default ({ children }) => (
  <div style={{ maxWidth: '600px', margin: '0 auto', padding: 20 }}>
    {children}
  </div>
)
