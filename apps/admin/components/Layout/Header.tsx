import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'
import Me from '../Auth/Me'
import { Logo } from './Logo'

const link = css({
  textDecoration: 'none',
  color: 'primary',
  _visited: {
    color: 'primary',
  },
  _hover: {
    color: 'primaryHover',
  },
})

const HeaderSection = (props: ComponentPropsWithoutRef<'div'>) => (
  <div
    {...props}
    className={cx(
      css({ display: 'flex', flexDirection: 'column' }),
      props.className,
    )}
  />
)

const HeaderComponent = ({ ...props }) => {
  const searchParams = props.search ? { search: props.search } : {}

  return (
    <header
      className={css({
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: 'divider',
        background: 'background',
        display: 'grid',
        gridTemplateColumns: '[52px 1fr max-content]',
        alignItems: 'center',
        gap: '4',
        py: '3',
        px: '4',
        zIndex: 1,
      })}
    >
      <HeaderSection>
        <Logo className={css({ width: 'full', height: 'auto' })} />
      </HeaderSection>
      <HeaderSection>
        <h1 className={css({ textStyle: 'h1Sans' })}>Admin</h1>
        <nav className={css({ display: 'flex', gap: '3' })}>
          <Link
            href={{
              pathname: '/users',
              query: searchParams,
            }}
            className={link}
          >
            Users
          </Link>
          <Link
            href={{
              pathname: '/mailbox',
              query: searchParams,
            }}
            className={link}
          >
            E-Mails
          </Link>
          <Link
            href={{
              pathname: '/payments',
              query: searchParams,
            }}
            className={link}
          >
            Payments
          </Link>
          <Link
            href={{
              pathname: '/postfinance-payments',
              query: searchParams,
            }}
            className={link}
          >
            Postfinance Payments
          </Link>
          <Link href='/merge-users' className={link}>
            Users zusammenführen
          </Link>
        </nav>
      </HeaderSection>
      <HeaderSection>
        <Me />
      </HeaderSection>
    </header>
  )
}

export default HeaderComponent
