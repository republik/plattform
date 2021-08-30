import React, { Children, useMemo } from 'react'
import { fontFamilies } from '../../../../theme/fonts'
import { Figure } from './Figure'

export const PullQuote = ({ children }) => {
  const figure = useMemo(() => {
    return Children.toArray(children).filter(element => element.type === Figure)
  }, [children])

  const rest = useMemo(() => {
    return Children.toArray(children).filter(element => element.type !== Figure)
  }, [children])

  return (
    <blockquote
      style={{
        margin: '60px 0'
      }}
    >
      {figure.length > 0 ? (
        <table style={{ width: '100%' }}>
          <tr style={{ verticalAlign: 'top' }}>
            <td
              style={{
                width: '155px',
                paddingRight: '15px'
              }}
            >
              {figure}
            </td>
            <td>{rest}</td>
          </tr>
        </table>
      ) : (
        children
      )}
    </blockquote>
  )
}

export const PullQuoteText = ({ children }) => (
  <p
    style={{
      fontFamily: fontFamilies.serifBold,
      fontWeight: '700',
      fontSize: '28px',
      lineHeight: '33px',
      margin: '0px'
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
