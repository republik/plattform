import { LOGO_VIEWBOX, LOGO_PATH } from '@republik/theme/logo'
import { css } from '@republik/theme/css'

export const Logo = () => {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={css({
        width: 'full',
        fill: 'text',
        height: '1rem',
      })}
    >
      <path d={LOGO_PATH}></path>
    </svg>
  )
}
