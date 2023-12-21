import { NativeAppMessageSync } from '@app/components/native-app'
import './root.css'

import { MatomoTracking } from '@app/components/matomo-tracking'
import { ThemeProvider } from '@app/components/theme-provider'
import { ApolloWrapper } from '@app/lib/apollo/provider'
import { css } from '@app/styled-system/css'
import Script from 'next/script'
import { ReactNode, Suspense } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
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
        style={{
          height: '100dvh',
        }}
      >
        <ThemeProvider>
          <ApolloWrapper>
            {children}
            <NativeAppMessageSync />
            <Suspense fallback={null}>
              <MatomoTracking />
            </Suspense>
          </ApolloWrapper>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_MATOMO_URL_BASE &&
          process.env.NEXT_PUBLIC_MATOMO_SITE_ID && (
            <>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
          var _paq = _paq || [];`,
                }}
              />
              <Script
                id='matomo'
                dangerouslySetInnerHTML={{
                  __html: `
            _paq.push(['enableLinkTracking']);
            ${
              process.env.NEXT_PUBLIC_BASE_URL.indexOf('https') === 0
                ? "_paq.push(['setSecureCookie', true]);"
                : ''
            }
            (function() {
              _paq.push(['setTrackerUrl', '${
                process.env.NEXT_PUBLIC_MATOMO_URL_BASE
              }/matomo.php']);
              _paq.push(['setSiteId', '${
                process.env.NEXT_PUBLIC_MATOMO_SITE_ID
              }']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.type='text/javascript'; g.async=true; g.defer=true; g.src='${
                process.env.NEXT_PUBLIC_MATOMO_URL_BASE
              }/matomo.js'; s.parentNode.insertBefore(g,s);
            })();`,
                }}
              />
            </>
          )}
      </body>
    </html>
  )
}
