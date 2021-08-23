import React from 'react'
import { fontFamilies } from '../../../../theme/fonts'

export const Heading2 = ({ children }) => (
  <h2
    style={{
      fontFamily: fontFamilies.serifBold,
      fontSize: '23px',
      lineHeight: '130%',
      marginTop: '60px'
    }}
  >
    {children}
  </h2>
)
