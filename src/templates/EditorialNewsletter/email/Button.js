import React from 'react'

export const Button = ({ href, title, primary, children, attributes }) => {
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
    backgroundColor: '#ffffff'
  }

  return (<td
    align="center"
    bgcolor={primary ? '#3CAD00' : '#4B6359'}
    borderSpacing="5px">
    <a
      href={href}
      title={title}
      {...attributes}
      style={{ ...styles, ...primary ? primaryStyles : secondaryStyles }}>{
      children}
    </a>
  </td>)
}

export default ({ children }) => (
  <table
    width="100%"
    border="0"
    cellSpacing="0"
    cellPadding="0">
    <tr>
      <td>
        <table
          border="0"
          cellSpacing="10px"
          cellPadding="0">
          <tr>
            {children}
          </tr>
        </table>
      </td>
    </tr>
  </table>
)
