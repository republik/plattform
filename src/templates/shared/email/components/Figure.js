import React from 'react'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

export const Figure = ({ children }) => <span>{children}</span>

export const Image = ({ src, alt, plain, maxWidth }) => (
  <img
    key='image'
    style={{
      border: '0px',
      width: 'auto',
      height: 'auto',
      margin: '0px',
      maxWidth: maxWidth
    }}
    width='600'
    src={imageResizeUrl(src, '600x')}
    alt={alt}
  />
)
