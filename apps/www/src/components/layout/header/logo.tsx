import logo from '@republik/theme/logo.json'
import { css } from '@republik/theme/css'

export const Logo = () => {
  return (
    <svg
      viewBox={logo.LOGO_VIEWBOX}
      className={css({
        width: 'full',
        fill: 'text',
        height: 'header.logoHeight',
      })}
    >
      <path d={logo.LOGO_PATH}></path>
    </svg>
  )
}
