import React, { useMemo } from 'react'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

export const Figure = ({ children }) => (
  <span style={{ marginBottom: '15px' }}>{children}</span>
)

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
