import { PageNav } from '@app/components/page-nav'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import Link from 'next/link'
import { IconMic } from '@republik/icons'
import { MeQueryResult } from '@app/graphql/republik-api/me.query'
import Image from 'next/image'

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

const Avatar = ({ me }: { me: MeQueryResult['me'] }) => {
  const style = css({
    position: 'relative',
    display: 'inline-block',
    width: 'header.avatar',
    height: 'header.avatar',
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

  return (
    <div
      className={css({
        bg: 'pageBackground',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'overlay',
      })}
    >
      <div
        className={hstack({
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'overlay',
        })}
      >
        <div className={css({ m: 'header.avatarMargin' })}>
          {me ? (
            <Link href='/meine-republik'>
              <Avatar me={me} />
            </Link>
          ) : (
            <Link href='/anmelden'>Anmelden</Link>
          )}
        </div>
        <div className={css({ m: 'header.logoMargin' })}>
          <Link href='/'>
            <Logo />
          </Link>
        </div>
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
      </div>

      <PageNav />
    </div>
  )
}
