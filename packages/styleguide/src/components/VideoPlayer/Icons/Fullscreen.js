import { IconFullscreen, IconFullscreenExit } from '@republik/icons'

const Icon = ({ size = 24, fill = '#fff', off = true }) => {
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
