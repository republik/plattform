import React from 'react'

export const CoverImage = ({ src, alt }) => {
  // skip rendering empty cover images
  // - some email clients show a prominent error when rendering an img tag without a src
  // - this happens for covers all the time because they currently can't be removed in publikator-frontend
  if (!src && !alt) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      border='0'
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        height: 'auto !important',
        maxWidth: '100% !important'
      }}
    />
  )
}

export default ({ children }) => (
  <tr>
    <td align='center' valign='top' className='cover'>
      {children}
    </td>
  </tr>
)
