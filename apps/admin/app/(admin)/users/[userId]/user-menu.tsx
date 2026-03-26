'use client'

import { css } from '@republik/theme/css'
import {
  BookUserIcon,
  EyeIcon,
  GiftIcon,
  KeyRoundIcon,
  MailsIcon,
  MessageCircleMoreIcon,
  NewspaperIcon,
  WalletIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon?: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      data-active={pathname === href}
      className={css({
        color: 'text.secondary',
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

        display: 'flex',
        alignItems: 'center',
        gap: '2',
      })}
    >
      <span className={css({ minW: '[18px]' })}>{icon}</span>
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
      <NavLink
        href={`/users/${userId}`}
        label='Übersicht'
        icon={<EyeIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/details`}
        label='Personalien'
        icon={<BookUserIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/subscriptions`}
        label='Abonnements'
        icon={<WalletIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/newsletters`}
        label='Newsletter'
        icon={<NewspaperIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/access-grants`}
        label='Access Grants'
        icon={<GiftIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/sessions`}
        label='Sessions'
        icon={<KeyRoundIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/mailbox`}
        label='E-Mails'
        icon={<MailsIcon size={18} />}
      />
      <NavLink
        href={`/users/${userId}/dialog`}
        label='Dialog'
        icon={<MessageCircleMoreIcon size={18} />}
      />
    </div>
  )
}
