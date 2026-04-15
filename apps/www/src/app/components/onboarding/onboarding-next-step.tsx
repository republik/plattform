import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'
import { ReactNode } from 'react'

export function OnboardingNextStep({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <div
      className={css({
        mt: 'auto',
        position: 'sticky',
        bottom: 0,
        background: 'background',
        textAlign: 'center',
        p: 6,
        pt: 2,
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'contrast',
      })}
    >
      <p className={css({ fontSize: 's', color: 'textSoft' })}>
        Ändern im Konto jederzeit möglich.
      </p>

      <div className={css({ md: { maxWidth: '330px', mx: 'auto' } })}>
        <Link
          className={cx(button({ size: 'full' }), css({ mt: 2 }))}
          href={href}
        >
          {children}
        </Link>
      </div>
    </div>
  )
}
