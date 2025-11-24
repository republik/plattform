import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'
import { ReactNode } from 'react'

export function OnboardingH3({ children }: { children: ReactNode }) {
  return (
    <h3
      className={css({
        fontFamily: 'gtAmericaStandard',
        fontWeight: 'bold',
        mb: 4,
      })}
    >
      {children}
    </h3>
  )
}

export function OnboardingNextStep({ href }: { href: string }) {
  return (
    <div
      className={css({
        position: 'sticky',
        bottom: 0,
        background: 'background',
        textAlign: 'center',
        p: 6,
        pt: 2,
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'black',
      })}
    >
      <p className={css({ fontSize: 's', color: 'textSoft' })}>
        Ändern im Konto jederzeit möglich.
      </p>

      <Link
        className={cx(button({ size: 'full' }), css({ mt: 2 }))}
        href={href}
      >
        Weiter
      </Link>
    </div>
  )
}
