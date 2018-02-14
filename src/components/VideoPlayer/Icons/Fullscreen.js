import React, { Fragment } from 'react'
import Fullscreen from 'react-icons/lib/md/fullscreen'
import FullscreenExit from 'react-icons/lib/md/fullscreen-exit'

const Icon = ({ size, fill, off }) => {
  if (off) {
    return (
      <Fullscreen
        size={size}
        height={size}
        fill={fill}
        style={{ verticalAlign: 'inherit' }}
      />
    )
  } else {
    return (
      <FullscreenExit
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
  off: true
}

export default Icon
