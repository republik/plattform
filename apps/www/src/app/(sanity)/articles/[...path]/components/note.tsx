import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export function Note({ children }: { children?: ReactNode }) {
  return (
    <p
      className={css({
        textStyle: 'sans',
        fontSize: 'xs',
        md: {
          fontSize: 's',
        },
      })}
    >
      {children}
    </p>
  )
}
