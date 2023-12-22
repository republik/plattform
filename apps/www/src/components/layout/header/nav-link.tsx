'use client'

import { css } from '#styled-system/css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLinkProps = {
  href: string
  children: React.ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      key={href}
      href={href}
      className={css({
        textDecoration: 'none',
        color: 'text',
        fontSize: 's',
        lineHeight: 'pageNav',
        px: {
          base: '2.5',
          md: '3.5',
        },
        _hover: { textDecoration: 'underline' },
        '&[aria-current="page"]': {
          fontWeight: 500,
        },
      })}
      aria-current={href === pathname ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}
