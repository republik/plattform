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
    borderSpacing: '30px 18px',
    backgroundColor: colors.primary
  }

  const tableStylesSecondary = {
    borderSpacing: '29px 17px',
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.secondary}`
  }

  return (<table
      width="100%"
      border="0"
      cellSpacing="0"
      cellPadding="0"
      style={{borderSpacing: "0 5px", borderCollapse: "separate"}}>
      <tbody>
        <tr>
          <td>
            <table
              width={block ? "100%" : undefined}
              border="0"
              cellSpacing="0"
              cellPadding="0"
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
