import React from 'react'

export const Button = ({ href, title, primary, block, children, attributes }) => {
  const styles = {
    fontSize: '20px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    textDecoration: 'none',
    borderRadius: 0,
    padding: '15px 30px 15px 30px',
    display: 'inline-block',
  }

  const primaryStyles = {
    color: '#ffffff'
  }

  const secondaryStyles = {
    color: '#4B6359',
    backgroundColor: '#ffffff',
    border: '1px solid #4B6359',
    padding: '14px 30px 14px 30px'
  }

  return (<table
      width="100%"
      border="0"
      cellSpacing="0"
      cellPadding="0">
      <tbody>
        <tr>
          <td>
            <table
              width={block && "100%"}
              border="0"
              cellSpacing="0"
              cellPadding="0"
              style={{borderSpacing: "0 5px", borderCollapse: "separate"}}>
              <tbody>
              <tr>
                <td
                  width={block && "100%"}
                  align="center"
                  bgcolor={primary ? '#3CAD00' : '#4B6359'}>
                  <a
                    href={href}
                    title={title}
                    {...attributes}
                    style={{ ...styles, ...primary ? primaryStyles : secondaryStyles, ...block && {width: "100%"}  }}>
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
