import React from 'react'
import { FullscreenIcon, FullscreenExitIcon } from '../../Icons'

const Icon = ({ size, fill, off }) => {
  if (off) {
    return (
      <FullscreenIcon
        size={size}
        height={size}
        fill={fill}
        style={{ verticalAlign: 'inherit' }}
      />
    )
  } else {
    return (
      <FullscreenExitIcon
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
