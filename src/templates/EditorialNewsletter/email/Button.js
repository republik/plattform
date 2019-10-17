import React from 'react'
import colors from '../../../theme/colors'
import { fontFamilies } from '../../../theme/fonts'

export const Button = ({ href, title, primary, block, children, attributes }) => {
  const styles = {
    fontSize: '20px',
    fontFamily: fontFamilies.sansSerifRegular,
    textDecoration: 'none',
    borderRadius: 0,
    display: 'inline-block',
    minWidth: 160,
    color: primary ? '#ffffff' : colors.secondary
  }

  const tableStylesPrimary = {
    backgroundColor: colors.primary
  }

  const tableStylesSecondary = {
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.secondary}`
  }

  return (<table
      width="100%"
      border="0"
      cellSpacing="5"
      cellPadding="0"
      style={{borderSpacing: 'separate', marginLeft: '-5px'}}>
      <tbody>
        <tr>
          <td>
            <table
              width={block ? "100%" : undefined}
              border="0"
              cellSpacing="0"
              cellPadding={primary ? "18" : "17"}
              style={primary ? tableStylesPrimary : tableStylesSecondary}>
              <tbody>
              <tr>
                <td
                  width={block ? "100%" : undefined}
                  align="center">
                  <a
                    href={href}
                    title={title}
                    {...attributes}
                    style={{ ...styles, ...block && {width: "100%"}  }}>
                    {children}
                  </a>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
