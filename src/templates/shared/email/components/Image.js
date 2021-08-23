import React, { useMemo } from 'react'

const Image = ({ alt, src, size }) => {
  const maxWidth = useMemo(() => {
    switch (size) {
      case 'tiny':
        return '325px'
      default:
        return '50%'
    }
  }, [size])

  return <img alt={alt} src={src} style={{ maxWidth }} />
}

export default Image
