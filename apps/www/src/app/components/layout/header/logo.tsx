import { css } from '@republik/theme/css'
import logo from '@republik/theme/logo.json'

export const Logo = ({ inverted }: { inverted?: boolean }) => {
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
