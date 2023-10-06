'use client'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import { IconSearchMenu } from '@republik/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Magazin' },
  { href: '/feed', label: 'Feed' },
  { href: '/dialog', label: 'Dialog' },
  { href: '/dossier/welche-schweiz-wollen-wir', label: 'Wahlen 2023' },
  { href: '/suche', label: 'Suche', icon: <IconSearchMenu size={18} /> },
]

export const PageNav = () => {
  // TODO: highlight current link – not relevant vor Challenge Accepted
  // const pathname = usePathname()

  return (
    <div
      className={hstack({
        gap: '0',
        justifyContent: 'center',
      })}
    >
      {navLinks.map(({ href, label, icon }) => {
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
            })}
          >
            {icon ?? label}
          </Link>
        )
      })}
    </div>
  )
}
