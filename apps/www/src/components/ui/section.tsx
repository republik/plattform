import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

export function SectionH3({ children }: { children: ReactNode }) {
  return (
    <h3
      className={css({
        fontFamily: 'gtAmericaStandard',
        fontWeight: 'bold',
        mb: 6,
        mx: 2,
        md: {
          textAlign: 'center',
        },
      })}
    >
      {children}
    </h3>
  )
}

export function Section({ children }: { children: ReactNode }) {
  return (
    <section
      className={css({ pt: 4, pb: 16, md: { maxWidth: 'shop', mx: 'auto' } })}
    >
      {children}
    </section>
  )
}

export const ArticleSection = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={css({
        margin: '0 auto',
        maxWidth: 'center',
        pl: '15px',
        pr: '15px',
      })}
    >
      {children}
    </div>
  )
}
