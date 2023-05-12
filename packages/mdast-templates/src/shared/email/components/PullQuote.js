import React, { Children, useMemo } from 'react'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'
import { Figure } from './Figure'

export const PullQuote = ({ children }) => {
  const figure = useMemo(() => {
    return Children.toArray(children).filter(
      (element) => element.type === Figure,
    )
  }, [children])

  const rest = useMemo(() => {
    return Children.toArray(children).filter(
      (element) => element.type !== Figure,
    )
  }, [children])

  return (
    <div
      style={{
        margin: '60px 0',
      }}
    >
      {figure.length > 0 ? (
        <table style={{ width: '100%' }}>
          <tbody>
            <tr style={{ verticalAlign: 'top' }}>
              <td
                style={{
                  width: '155px',
                  paddingRight: '15px',
                }}
              >
                {figure}
              </td>
              <td>{rest}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        children
      )}
    </div>
  )
}

export const PullQuoteText = ({ children }) => (
  <p
    style={{
      ...fontStyles.serifBold,
      fontSize: '28px',
      lineHeight: '33px',
      margin: '0px',
    }}
  >
    {children}
  </p>
)

export const PullQuoteSource = ({ children }) => (
  <cite
    style={{
      display: 'block',
      ...fontStyles.sansSerifRegular,
      fontSize: '15px',
      lineHeight: '21px',
      margin: '21px 0 0 0',
      fontStyle: 'normal',
    }}
  >
    {children}
  </cite>
)
