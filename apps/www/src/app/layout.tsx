import './globals.css'

import { ThemeProvider } from '@app/components/theme-provider'
import { UserMenu } from '@app/components/user-menu'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { ReactNode } from 'react'
import { getMe } from '@app/lib/auth/me'

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  const me = await getMe()

  // TODO: Don't hard-code this
  const pageTheme = 'challenge-accepted'

  return (
    <html lang='de' suppressHydrationWarning data-page-theme={pageTheme}>
      <body
        className={css({
          color: 'text',
          textStyle: 'body',
          bg: 'pageBackground',
          '& :where(a)': {
            color: 'link',
            textDecoration: 'underline',
          },
        })}
      >
        <ThemeProvider>
          <Frame me={me} />
          <main className={css({ p: '4' })}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

const Frame = ({ me }) => {
  return (
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
  )
}
