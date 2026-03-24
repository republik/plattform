'use client'

import { css } from '@republik/theme/css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      data-active={pathname === href}
      className={css({
        color: 'text',

        textDecoration: 'none',
        '&[data-active="true"]': {
          textDecoration: 'underline',
        },
      })}
    >
      {label}
    </Link>
  )
}

export function UserMenu({ userId }: { userId: string }) {
  return (
    <div className={css({ display: 'flex', gap: '4' })}>
      <NavLink href={`/users/${userId}`} label='Übersicht' />
      <NavLink href={`/users/${userId}/sessions`} label='Sessions' />
      <NavLink href={`/users/${userId}/access-grants`} label='Access Grants' />
      <NavLink href={`/users/${userId}/mailbox`} label='E-Mails' />
      <NavLink href={`/users/${userId}/dialog`} label='Dialog' />
    </div>
  )
}
