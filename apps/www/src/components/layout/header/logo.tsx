import { LOGO_PATH, LOGO_VIEWBOX } from '@republik/theme/logo'
import { css } from '@republik/theme/css'

export const Logo = () => {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={css({
        width: 'full',
        fill: 'text',
        height: 'header.logoHeight',
      })}
    >
      <path d={LOGO_PATH}></path>
    </svg>
  )
}
