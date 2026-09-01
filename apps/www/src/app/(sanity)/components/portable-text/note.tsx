import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export function Note({ children }: { children?: ReactNode }) {
  return (
    <p
      // Sizes follow the reader's font size setting — see `READER_FONT_SCALE` in
      // the theme package.
      className={css({
        textStyle: 'sans',
        fontSize: 'calc(token(fontSizes.xs) * var(--article-font-scale, 1))',
        md: {
          fontSize: 'calc(token(fontSizes.s) * var(--article-font-scale, 1))',
        },
      })}
    >
      {children}
    </p>
  )
}
