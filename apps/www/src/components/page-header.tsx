import { PageNav } from '@app/components/page-nav'
import { UserMenu } from '@app/components/user-menu'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'

import { IconSearchMenu } from '@republik/icons'
import Link from 'next/link'

export const PageHeader = async () => {
  const me = await getMe()

  return (
    <div className={css({ bg: 'pageBackground' })}>
      <div
        className={css({
          p: '4',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'contrast',
        })}
      >
        {me ? (
          <UserMenu me={me}></UserMenu>
        ) : (
          <Link href='/anmelden'>Anmelden</Link>
        )}{' '}
        | <Link href='/'>Ab zum Magazin</Link>
      </div>
      <PageNav />
    </div>
  )
}
