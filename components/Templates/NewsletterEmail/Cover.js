import React from 'react'

export const Lead = () => null

export const Title = () => null

export default ({ data: { src, alt }, children }) => {
  return (
    <tr>
      <td align='center' valign='top'>
        <img src={src} alt={alt} border='0' style={{
          margin: 0,
          padding: 0,
          width: '100%',
          height: 'auto !important',
          maxWidth: '100% !important'
        }} />
      </td>
    </tr>
  )
}
