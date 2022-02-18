import React from 'react'
import { fontStyles } from '../../../../theme/fonts'

export const Heading2 = ({ children }) => (
  <h2
    style={{
      ...fontStyles.serifBold,
      fontSize: '24px',
      lineHeight: '30px',
      margin: '46px 0 12px 0',
    }}
  >
    {children}
  </h2>
)
