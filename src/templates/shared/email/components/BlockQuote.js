import React from 'react'
import { fontStyles } from '../../../../theme/fonts'

const BlockQuote = ({ children }) => <div>{children}</div>

export default BlockQuote

export const Paragraph = ({ children }) => (
  <p
    style={{
      margin: 0,
      padding: '20px 25px',
      ...fontStyles.sansSerifRegular,
      fontSize: '18px',
      lineHeight: '30px',
      backgroundColor: '#F6F8F7'
    }}
  >
    {children}
  </p>
)
