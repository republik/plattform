import React from 'react'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

export const Figure = ({ children }) => (
  <span style={{ marginBottom: '15px' }}>{children}</span>
)

export const Image = ({ src, alt, width, resize }) => (
  <img
    key='image'
    style={{
      border: '0px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100%',
      width,
    }}
    width={width}
    src={imageResizeUrl(
      src,
      // If no resize value is given calculate a resize url for the width
      `${(resize ? resize : width).replace('px', '')}x`,
    )}
    alt={alt}
  />
)
