import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import Link from 'next/link'
import { IconAccountBox, IconMic, IconSearchMenu } from '@republik/icons'
import Image from 'next/image'
import { NavLink } from './nav-link'
import { MeQuery } from '@app/graphql/republik-api/gql/graphql'

const Logo = () => {
  return (
    <svg
      viewBox={process.env.NEXT_PUBLIC_SG_LOGO_VIEWBOX}
      className={css({
        width: 'full',
        fill: 'text',
        height: 'header.logoHeight',
      })}
    >
      <path d={process.env.NEXT_PUBLIC_SG_LOGO_PATH}></path>
    </svg>
  )
}

const getInitials = (me) =>
  (me.name && me.name.trim()
    ? me.name.split(' ').filter((n, i, all) => i === 0 || all.length - 1 === i)
    : me.email
        .split('@')[0]
        .split(/\.|-|_/)
        .slice(0, 2)
  )
    .slice(0, 2)
    .filter(Boolean)
    .map((s) => s[0])
    .join('')

const Avatar = ({ me }: { me: MeQuery['me'] }) => {
  const style = css({
    position: 'relative',
    display: 'inline-block',
    width: 'header.avatar',
    height: 'header.avatar',
    objectFit: 'cover',
  })

  return me?.portrait ? (
    <Image
      src={me.portrait}
      height={32}
      width={32}
      className={style}
      alt='Portrait'
    />
  ) : (
    <span className={style}>{getInitials(me)}</span>
  )
}

export const PageHeader = async () => {
  const me = await getMe()

  const navLinks = [
    { href: '/', label: 'Magazin' },
    { href: '/feed', label: 'Feed' },
    { href: '/dialog', label: 'Dialog' },
    { href: '/suche', label: 'Suche', icon: <IconSearchMenu size={18} /> },
  ]

  return (
    <div
      className={css({
        bg: 'pageBackground',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
      })}
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
          {me ? (
            <Link href='/meine-republik'>
              <Avatar me={me} />
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
          {me?.activeMembership?.id ? (
            <div
              className={css({
                width: 'header.avatar',
                height: 'header.avatar',
                m: 'header.avatarMargin',
                display: 'flex',
                placeContent: 'center center',
              })}
            >
              <button disabled className={css({ p: '0' })}>
                <IconMic size={28} />
              </button>
            </div>
          ) : (
            <Link
              href='/angebote'
              className={css({
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                alignSelf: 'stretch',
                background: 'text',
                color: 'text.inverted',
                padding: '10px 20px',
                fontSize: '16px',
                height: '100%',
                md: {
                  padding: '10px 30px',
                  fontSize: '22px',
                },
              })}
            >
              <span
                className={css({
                  display: 'none',
                  md: { display: 'inline-block' },
                })}
              >
                Jetzt abonnieren
              </span>
              <span
                className={css({
                  display: 'inline-block',
                  md: {
                    display: 'none',
                  },
                })}
              >
                Abo
              </span>
            </Link>
          )}
        </div>
      </div>

      {me?.activeMembership?.id ? (
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
