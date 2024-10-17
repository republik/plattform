import { IconFullscreen, IconFullscreenExit } from '@republik/icons'
import React from 'react'

type IconProps = {
  size?: number
  fill?: string
  off?: boolean
}

const Icon = ({ size = 24, fill = '#ffffff', off = true }: IconProps) => {
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

export default Icon
