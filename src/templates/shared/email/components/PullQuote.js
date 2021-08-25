import React from 'react'
import { fontFamilies } from '../../../../theme/fonts'

export const PullQuote = ({ children, hasFigure }) => {
  return <blockquote>{children}</blockquote>
}

export const PullQuoteText = ({ children }) => (
  <p
    style={{
      fontFamily: fontFamilies.serifBold,
      fontWeight: '700',
      fontSize: '28px',
      lineHeight: '33px'
    }}
  >
    {children}
  </p>
)

export const PullQuoteSource = ({ children }) => (
  <cite
    style={{
      fontFamily: fontFamilies.sansSerifRegular,
      fontSize: '15px',
      marginTop: '21px',
      fontStyle: 'normal'
    }}
  >
    {children}
  </cite>
)
