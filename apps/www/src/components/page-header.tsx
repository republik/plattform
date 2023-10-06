import { PageNav } from '@app/components/page-nav'
import { UserMenu } from '@app/components/user-menu'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import Link from 'next/link'

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
        <div className={css({ p: 'header.avatarPadding' })}>
          {me ? (
            <UserMenu me={me}></UserMenu>
          ) : (
            <Link href='/anmelden'>Anmelden</Link>
          )}
        </div>
        <div className={css({ p: 'header.logoPadding' })}>
          <Link href='/'>
            <Logo />
          </Link>
        </div>
        <div
          className={css({
            width: 'header.avatar',
            height: 'header.avatar',
            p: 'header.avatarPadding',
          })}
        ></div>
      </div>

      <PageNav />
    </div>
  )
}
