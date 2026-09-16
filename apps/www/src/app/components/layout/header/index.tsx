'use client'

import { useScrollDirection } from '@/app/lib/hooks/useScrollDirection'
import AudioPlayerToggle from '@/components/Frame/AudioPlayerToggle'
import { IconSearchMenu } from '@republik/icons'
import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import Link from 'next/link'
import { Suspense, useRef, type ReactNode } from 'react'
import { Logo } from './logo'
import { NavLink } from './nav-link'
import { Avatar } from '@/app/components/layout/header/avatar'

const MAX_HEADER_HEIGHT = 102

export function PageHeader() {
  const headerRef = useRef<HTMLDivElement>(null)
  const scrollDirection = useScrollDirection({
    upThreshold: 25,
    downThreshold: MAX_HEADER_HEIGHT,
  })

  const navLinks = [
    { href: '/', label: 'Magazin' },
    { href: '/feed', label: 'Feed' },
    { href: '/dialog', label: 'Dialog' },
    { href: '/suche', label: 'Suche', icon: <IconSearchMenu size={18} /> },
  ]

  return (
    <div
      ref={headerRef}
      className={css({
        bg: 'pageBackground',
        position: 'sticky',
        top: 0,
        transition: 'transform 0.3s ease-out',
        zIndex: 100,
        '@media print': { display: 'none' },
      })}
      style={{
        transform: `translateY(${
          scrollDirection === 'down' ? -MAX_HEADER_HEIGHT : 0
        }px)`,
      }}
    >
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr max-content 1fr',
          alignItems: 'center',
          width: 'full',
          px: '4',
          height: 'header.height',
        })}
      >
        <div>
          <Avatar />
        </div>
        <div>
          {/*
            FIXME: disable prefetching of the front because it's running in an infinite loop in prod
            See https://github.com/vercel/next.js/issues/97329
            */}
          <Link href='/' prefetch={false}>
            <Logo />
          </Link>
        </div>
        <div
          className={css({
            width: 'header.avatar',
            height: 'header.avatar',
            display: 'grid',
            placeContent: 'center',
            placeSelf: 'center end',
          })}
        >
          <AudioPlayerToggle />
        </div>
      </div>
      <div
        className={hstack({
          gap: '0',
          justifyContent: 'center',
          borderTop: '1px solid',
          borderTopColor: 'divider',
        })}
      >
        {navLinks.map(({ href, label, icon }) => (
          <NavLink key={href} href={href}>
            {icon || label}
          </NavLink>
        ))}
      </div>
      <hr
        className={css({
          left: 0,
          right: 0,
          height: 'var(--page-theme-accent-bar-height)',
          color: 'divider',
          backgroundColor: 'var(--page-theme-accent-color)',
          borderTopColor: 'var(--page-theme-accent-color)',
          borderTopWidth: 1,
          borderTopStyle: 'solid',
        })}
      />
    </div>
  )
}
