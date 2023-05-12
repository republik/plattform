import React from 'react'
import { fontFamilies } from '@project-r/styleguide/src/theme/fonts'

export const Caption = ({ children }) => (
  <p
    key='caption'
    style={{
      fontSize: '15px',
      lineHeight: '18px',
      fontFamily: fontFamilies.sansSerifRegular,
      marginTop: '5px',
      textAlign: 'left',
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
      lineHeight: '15px',
      fontFamily: fontFamilies.sansSerifRegular,
    }}
  >
    {children}
  </span>
)
