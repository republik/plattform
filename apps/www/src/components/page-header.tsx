import { UserMenu } from '@app/components/user-menu'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import Link from 'next/link'

export const PageHeader = async () => {
  const me = await getMe()

  return (
    <div
      className={css({
        p: '4',
        bg: 'pageBackground',
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
  )
}
