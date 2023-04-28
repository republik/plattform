import { IconFullscreen, IconFullscreenExit } from '@republik/icons'
import React from 'react'

const Icon = ({ size, fill, off }) => {
  if (off) {
    return (
      <IconFullscreen
        size={size}
        height={size}
        fill={fill}
        style={{ verticalAlign: 'inherit' }}
      />
    )
  } else {
    return (
      <IconFullscreenExit
        size={size}
        height={size}
        fill={fill}
        style={{ verticalAlign: 'inherit' }}
      />
    )
  }
}

Icon.defaultProps = {
  size: 24,
  fill: '#fff',
  off: true,
}

export default Icon
