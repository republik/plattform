import { css, cx } from '@republik/theme/css'
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

type ArticleSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export const ArticleSection = ({
  children,
  className,
}: ArticleSectionProps) => {
  return (
    <div
      className={cx(
        css({
          margin: '0 auto',
          maxWidth: 'center',
          pl: '15px',
          pr: '15px',
        }),
        className,
      )}
    >
      {children}
    </div>
  )
}
