import './globals.css'

import Link from 'next/link'
import { ReactNode } from 'react'
import { css } from '../styled-system/css'
import { ThemeProvider } from './components/ThemeProvider'
import { getClient } from './utils/ApolloClient'
import { meQuery } from './utils/graphql/meQuery'

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  const me = await getMe()

  return (
    <html lang='de' suppressHydrationWarning>
      <body className={css({ bg: 'challengeAccepted.background' })}>
        <ThemeProvider>
          <Frame me={me} />
          <main className={css({ p: '4' })}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

const getMe = async () => {
  const { data } = await getClient().query({ query: meQuery })

  return data.me
}

const Frame = ({ me }) => {
  return (
    <div className={css({ p: '4' })}>
      {' '}
      {me ? (
        `Hey, ${me.firstName}`
      ) : (
        <Link href='/anmelden'>Anmelden</Link>
      )} | <Link href='/'>Ab zum Magazin</Link>
    </div>
  )
}
