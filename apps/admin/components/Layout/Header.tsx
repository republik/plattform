'use client'
import { Me } from '@/components/Auth/Me'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import { Logo } from './Logo'
import { usePathname, useSearchParams } from 'next/navigation'

const HeaderSection = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    className={cx(css({ display: 'flex', gap: '4' }), props.className)}
  />
)

function NavLink({
  href,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  return (
    <Link
      data-active={pathname.startsWith(href.toString())}
      className={css({
        textDecoration: 'none',
        color: 'current',
        _visited: {
          color: 'current',
        },
        _hover: {
          textDecoration: 'underline',
        },

        '&[data-active="true"]': {
          textDecoration: 'underline',
        },
      })}
      href={`${href}?${searchParams}`}
      {...props}
    >
      {children}
    </Link>
  )
}

const HeaderComponent = () => {
  return (
    <header
      className={css({
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: 'divider',
        background: 'text',
        color: 'text.inverted',
        display: 'grid',
        gridTemplateColumns: '[auto 1fr max-content]',
        alignItems: 'center',
        gap: '4',
        py: '3',
        px: '4',
        zIndex: 1,
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'baseline',
          gap: '2',
        })}
      >
        <Logo className={css({ width: '[20px]', height: 'auto' })} />
        <h2 className={css({ textStyle: 'h2Sans' })}>Admin</h2>
      </div>
      <HeaderSection>
        <nav
          className={css({ display: 'flex', gap: '3', alignItems: 'baseline' })}
        >
          <NavLink href='/users'>Users</NavLink>
          <NavLink href='/mailbox'>E-Mails</NavLink>
          <NavLink href='/payments'>Payments</NavLink>
          <NavLink href='/postfinance-payments'>Postfinance Payments</NavLink>
          <NavLink href='/merge-users'>Users zusammenführen</NavLink>
        </nav>
      </HeaderSection>
      <HeaderSection>
        <Me />
      </HeaderSection>
    </header>
  )
}

export default HeaderComponent
