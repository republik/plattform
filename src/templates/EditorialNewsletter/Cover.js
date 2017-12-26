import React from 'react'

export const CoverImage = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    border="0"
    style={{
      margin: 0,
      padding: 0,
      width: '100%',
      height: 'auto !important',
      maxWidth: '100% !important'
    }}
  />
)

export default ({ children }) => (
  <tr>
    <td align="center" valign="top" className="cover">
      {children}
    </td>
  </tr>
)
