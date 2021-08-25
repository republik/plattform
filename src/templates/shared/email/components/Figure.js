import React, { useMemo } from 'react'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

export const Figure = ({ children }) => <div>{children}</div>

export const Image = ({ src, alt, maxWidth, size, fullWidth }) => {
  const width = useMemo(() => {
    if (fullWidth) return '100%'
    switch (size) {
      case 'tiny':
        return '325px'
      default:
        return '600px' // Default email container width
    }
  }, [size, maxWidth])

  return (
    <img
      key='image'
      style={{
        border: '0px',
        height: 'auto',
        margin: '0px',
        maxWidth,
        width
      }}
      width={width}
      src={imageResizeUrl(src, '600x')}
      alt={alt}
    />
  )
}
