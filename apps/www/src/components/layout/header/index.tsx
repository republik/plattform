'use client'

import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import Link from 'next/link'
import { IconAccountBox, IconMic, IconSearchMenu } from '@republik/icons'
import Image from 'next/image'
import { NavLink } from './nav-link'
import { MeQuery } from '#graphql/republik-api/__generated__/gql/graphql'
import { ComponentPropsWithoutRef, useRef } from 'react'
import { useScrollDirection } from '@app/lib/hooks/useScrollDirection'
import { Logo } from './logo'

const getInitials = (name, email) =>
  (name && name.trim()
    ? name.split(' ').filter((n, i, all) => i === 0 || all.length - 1 === i)
    : email
        .split('@')[0]
        .split(/\.|-|_/)
        .slice(0, 2)
  )
    .slice(0, 2)
    .filter(Boolean)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

const Avatar = ({
  portrait,
  name,
  email,
}: Pick<MeQuery['me'], 'portrait' | 'email' | 'name'>) => {
  const style = css({
    position: 'relative',
    display: 'inline-block',
    width: 'header.avatar',
    height: 'header.avatar',
    objectFit: 'cover',
    color: 'text',
  })

  return portrait ? (
    <Image
      src={portrait}
      height={32}
      width={32}
      className={style}
      alt='Portrait'
    />
  ) : (
    <span className={style}>{getInitials(name, email)}</span>
  )
}

const MAX_HEADER_HEIGHT = 100

type PageHeaderProps = {
  isLoggedIn: boolean
  hasActiveMembership: boolean
  portrait?: ComponentPropsWithoutRef<typeof Avatar>
}

export function PageHeader({
  isLoggedIn,
  hasActiveMembership,
  portrait,
}: PageHeaderProps) {
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
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        position: 'sticky',
        top: 0,
        transition: 'transform 0.3s ease-out',
        zIndex: 100,
      })}
      style={{
        transform: `translateY(${
          scrollDirection === 'down' ? -(MAX_HEADER_HEIGHT + 1) : 0
        }px)`,
      }}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <div
          className={css({ p: 'header.avatarMargin', md: { width: '100%' } })}
        >
          {isLoggedIn ? (
            <Link href='/meine-republik'>
              <Avatar {...portrait} />
            </Link>
          ) : (
            <Link
              href='/anmelden'
              className={css({
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                textDecoration: 'none',
                gap: '5px',
                color: 'text',
              })}
            >
              <IconAccountBox aria-label='Anmelden' size={32} />
              <span
                className={css({
                  display: 'none',
                  md: {
                    display: 'inline-block',
                  },
                })}
              >
                Anmelden
              </span>
            </Link>
          )}
        </div>
        <div className={css({ m: 'header.logoMargin', md: { width: '100%' } })}>
          <Link href='/'>
            <Logo />
          </Link>
        </div>
        <div
          className={css({
            alignSelf: 'stretch',
            md: { width: '100%' },
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          })}
        >
          <div
            className={css({
              width: 'header.avatar',
              height: 'header.avatar',
              m: 'header.avatarMargin',
              display: 'flex',
              placeContent: 'center center',
            })}
          >
            {
              hasActiveMembership ? (
                <button disabled className={css({ p: '0' })}>
                  <IconMic size={28} />
                </button>
              ) : null

              // TODO: decide what to do with this abonnieren CTA

              // <Link
              //   href='/angebote'
              //   className={css({
              //     textDecoration: 'none',
              //     display: 'flex',
              //     alignItems: 'center',
              //     justifyContent: 'center',
              //     flexDirection: 'row',
              //     alignSelf: 'stretch',
              //     background: 'text',
              //     color: 'text.inverted',
              //     padding: '10px 20px',
              //     fontSize: '16px',
              //     height: '100%',
              //     md: {
              //       padding: '10px 30px',
              //       fontSize: '22px',
              //     },
              //   })}
              // >
              //   <span
              //     className={css({
              //       display: 'none',
              //       md: { display: 'inline-block' },
              //     })}
              //   >
              //     Jetzt abonnieren
              //   </span>
              //   <span
              //     className={css({
              //       display: 'inline-block',
              //       md: {
              //         display: 'none',
              //       },
              //     })}
              //   >
              //     Abo
              //   </span>
              // </Link>
            }
          </div>
        </div>
      </div>

      {hasActiveMembership ? (
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
      ) : null}
    </div>
  )
}
