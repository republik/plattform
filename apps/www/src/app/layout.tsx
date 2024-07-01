import PlausibleProvider from 'next-plausible'

import { NativeAppMessageSync } from '@app/components/native-app'
import '@republik/theme/styles.css'
import '@republik/theme/fonts.css'

import { ThemeProvider } from '@app/components/theme-provider'
import { ApolloWrapper } from '@app/lib/apollo/provider'
import { css } from '@republik/theme/css'
import { PUBLIC_BASE_URL } from 'lib/constants'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_BASE_URL),
  title: {
    default: 'Republik',
    template: '%s – Republik',
  },
}

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang='de'
      suppressHydrationWarning
      className={css({ scrollPaddingTop: '16-32' })}
    >
      <head>
        <PlausibleProvider
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          revenue
        />
      </head>
      <body
        className={css({
          color: 'text',
          textStyle: 'body',
          bg: 'pageBackground',
        })}
        style={{
          height: '100dvh',
        }}
      >
        <ThemeProvider>
          <ApolloWrapper>
            {children}
            <NativeAppMessageSync />
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
