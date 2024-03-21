import { css } from '@app/styled-system/css'

export const Logo = () => {
  return (
    <svg
      viewBox={process.env.NEXT_PUBLIC_SG_LOGO_VIEWBOX}
      className={css({
        width: 'full',
        fill: 'text',
        height: '1rem',
      })}
    >
      <path d={process.env.NEXT_PUBLIC_SG_LOGO_PATH}></path>
    </svg>
  )
}
