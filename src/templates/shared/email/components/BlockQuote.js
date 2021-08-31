import React from 'react'
import { fontStyles } from '../../../../theme/fonts'

const BlockQuote = ({ children }) => (
  <div style={{ backgroundColor: '#F6F8F7' }}>{children}</div>
)

export default BlockQuote

export const Paragraph = ({ children }) => (
  <p
    style={{
      margin: '20px 25px',
      ...fontStyles.sansSerifRegular,
      fontSize: '18px',
      lineHeight: '30px'
    }}
  >
    {children}
  </p>
)
