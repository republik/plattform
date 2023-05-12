import React, { Children, useMemo } from 'react'
import { fontStyles } from '@project-r/styleguide/src/theme/fonts'
import { Figure } from './Figure'

const InfoBox = ({ children }) => {
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

export default InfoBox

export const Title = ({ children }) => (
  <p
    style={{
      ...fontStyles.sansSerifMedium,
      fontSize: '19px',
      lineHeight: '30px',
      margin: '0 0 12px 0',
      borderTop: '1px solid',
    }}
  >
    {children}
  </p>
)

export const SubTitle = ({ children }) => (
  <p
    style={{
      ...fontStyles.sansSerifMedium,
      fontSize: '18px',
      lineHeight: '24px',
    }}
  >
    {children}
  </p>
)

export const Text = ({ children, noMargin }) => (
  <p
    style={{
      ...fontStyles.sansSerifRegular,
      fontSize: '18px',
      lineHeight: '30px',
      margin: noMargin ? '0px 0px' : undefined,
    }}
  >
    {children}
  </p>
)
