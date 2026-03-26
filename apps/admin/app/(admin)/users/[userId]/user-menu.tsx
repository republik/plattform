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
        color: 'textSoft',
        py: '1',
        px: '2',
        borderRadius: '[5px]',

        textDecoration: 'none',
        _hover: {
          background: 'hover',
          color: 'text',
        },
        '&[data-active="true"]': {
          background: 'hover',
          color: 'text',
        },
      })}
    >
      {label}
    </Link>
  )
}

export function UserMenu({ userId }: { userId: string }) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
        p: '2',
      })}
    >
      <NavLink href={`/users/${userId}`} label='Übersicht' />
      <NavLink href={`/users/${userId}/details`} label='Personalien' />
      <NavLink href={`/users/${userId}/subscriptions`} label='Abonnements' />
      <NavLink href={`/users/${userId}/newsletters`} label='Newsletter' />
      <NavLink href={`/users/${userId}/access-grants`} label='Access Grants' />
      <NavLink href={`/users/${userId}/sessions`} label='Sessions' />
      <NavLink href={`/users/${userId}/mailbox`} label='E-Mails' />
      <NavLink href={`/users/${userId}/dialog`} label='Dialog' />
    </div>
  )
}
