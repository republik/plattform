import React from 'react'

import { imageResizeUrl } from 'mdast-react-render/lib/utils'

export const Image = ({ src, alt }) =>
  <img key='image'
    style={{
      border: '0px',
      width: '640px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100% !important'
    }}
    width='640'
    src={imageResizeUrl(src, '600x')}
    alt={alt}
  />

export const Caption = ({ children, data }) => (
  <p key='caption' style={{
    fontSize: '14px',
    fontFamily: 'arial,helvetica neue,helvetica,sans-serif',
    marginTop: '5px'
    // obey data.captionRight?
  }}>
    {children}
  </p>
)

export default ({ children }) =>
  <span>
    {children}
  </span>
