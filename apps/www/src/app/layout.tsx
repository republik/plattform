import { NativeAppMessageSync } from '@app/components/native-app'
import '@republik/theme/fonts.css'
import '@republik/theme/styles.css'

import { PaynoteOverlay } from '@app/components/paynotes/paynote/paynote-overlay'
import { ThemeProvider } from '@app/components/theme-provider'
import { AnalyticsProvider } from '@app/lib/analytics/provider'
import { SyncUTMToSessionStorage } from '@app/lib/analytics/utm-session-storage'
import { ApolloWrapper } from '@app/lib/apollo/provider'
import { css } from '@republik/theme/css'
import { PUBLIC_BASE_URL } from 'lib/constants'
import MeContextProvider from 'lib/context/MeContext'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_BASE_URL),
  title: {
    default: 'Republik',
    template: '%s – Republik',
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          url: '/feed.xml',
          title: 'RSS Feed',
        },
      ],
    },
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
            <MeContextProvider>
              <AnalyticsProvider>
                {children}
                <NativeAppMessageSync />
                <SyncUTMToSessionStorage />
                {/* <PaynoteOverlay /> */}
              </AnalyticsProvider>
            </MeContextProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
