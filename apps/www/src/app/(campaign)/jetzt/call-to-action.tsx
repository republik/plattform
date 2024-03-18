'use client'
import { Logo } from '@app/app/(campaign)/components/logo'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const CTA = ({ href }: { href: string }) => {
  const pageSearchParams = useSearchParams()
  const url = new URL(href, process.env.NEXT_PUBLIC_BASE_URL)
  // Pass utm_* params to /angebote page
  for (const [k, v] of pageSearchParams) {
    if (k.startsWith('utm_')) {
      url.searchParams.set(k, v)
    }
  }
  const linkHref = url.pathname + url.search

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2',
        position: 'sticky',
        bottom: '0',
        pb: '4',
        pt: '16',
        backgroundGradient: 'stickyBottomPanelBackground',
        width: 'full',
      })}
    >
      <Link
        className={css({
          background: 'contrast',
          color: 'text.inverted',
          px: '4',
          py: '3',
          borderRadius: '4px',
          fontWeight: 'medium',
          cursor: 'pointer',
          textDecoration: 'none',
          textAlign: 'center',
          display: 'block',
          border: '2px solid token(colors.contrast)',
          // width: 'full',
          _hover: {
            background: 'text.inverted',
            color: 'contrast',
          },
        })}
        href={linkHref}
      >
        Wählen Sie Ihren Einstiegspreis
      </Link>
      <p className={css({ fontSize: 'base' })}> ab CHF 120 für ein Jahr</p>
      <div className={css({ pt: '2' })}>
        <Link href='/' className={css({ textDecoration: 'none' })}>
          <Logo />
        </Link>
      </div>
    </div>
  )
}
