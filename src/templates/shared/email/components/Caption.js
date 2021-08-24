import React from 'react'
import { fontFamilies } from '../../../../theme/fonts'

export const Caption = ({ children }) => (
  <p
    key='caption'
    style={{
      fontSize: '15px',
      fontFamily: fontFamilies.sansSerifRegular,
      marginTop: '5px',
      marginBottom: '30px',
      textAlign: 'left'
    }}
  >
    {children}
  </p>
)

export const Byline = ({ children }) => (
  <span
    key='caption'
    style={{
      fontSize: '12px',
      fontFamily: fontFamilies.sansSerifRegular
    }}
  >
    {children}
  </span>
)
