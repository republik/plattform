import { PageNav } from '@app/components/page-nav'
import { UserMenu } from '@app/components/user-menu'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import Link from 'next/link'
import { IconMic } from '@republik/icons'

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
            <UserMenu me={me}></UserMenu>
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
